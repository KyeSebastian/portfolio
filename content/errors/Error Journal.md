# Error Journal

Running log of everything that went wrong during the home lab build - misconfigurations, wrong assumptions, and just plain confusion in the middle of a wizard. Kept on purpose. "Broke it, figured out why, fixed it" is a better documentation/interview story than a build that went perfectly, and a clean writeup later loses all the texture of what actually happened.

Format: what happened, root cause, how it got fixed, and the talking point it turns into.

## How This Gets Used in the Blog

Every entry below carries a stable anchor id (the `<a id="...">` tag right above its heading). In the actual blog posts, the specific sentence describing a mistake gets wrapped in a plain, classic blue+underlined hyperlink pointing to `/errors#that-id` - deliberately styled differently from the site's normal nav/citation links, so a reader instantly recognizes "this blue link goes to a real mistake and its fix," not just a reference. This file is the source of truth the blog's `/errors` appendix page renders from - anchor ids should never be renamed once a post links to one, only added to.

---

## Proxmox Host Setup

<a id="err-scaling-governor-powersave"></a>
### Scaling governor set to `powersave` instead of `performance`
- **When:** 2026-07-12
- **What happened:** Ran the `scaling-governor.sh` community script intending to set CPU scaling to `performance`. First pass landed on `powersave` instead.
- **Root cause:** Picked the wrong option in the script's menu.
- **Fix:** Reran the script, corrected to `performance`, confirmed crontab persistence so it survives reboot.
- **Talking point:** Easy to blow past a script's own menu without reading it carefully - worth double-checking the applied state (`cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor`) after running any config script instead of trusting the exit code alone.

---

## pfSense ISO / Install

<a id="err-pfsense-iso-gzip"></a>
### Downloaded ISO was actually gzip-compressed
- **When:** 2026-07-13
- **What happened:** Downloaded the pfSense CE installer from the new `pfsense.org` to `shop.netgate.com` flow. File showed as `netgate-installer-v1.2-RELEASE-amd64.iso` in Windows Explorer, but Proxmox wouldn't treat it as a valid ISO.
- **Root cause:** Windows Explorer had "hide extensions for known file types" on, so the real filename (`....iso.gz`) was being displayed without the `.gz`. The file was gzip-compressed, not a raw ISO.
- **Fix:** Installed 7-Zip, extracted the real ~1GB `.iso` out of the `.gz`, uploaded that instead.
- **Talking point:** A file's displayed name is not proof of its actual format - this is also a real phishing/malware vector (`invoice.pdf.exe` hidden as `invoice.pdf`), so the habit of checking real extensions has security relevance beyond just this one download.

---

## pfSense Network Configuration

<a id="err-wan-lan-subnet-collision"></a>
### WAN and LAN both landed on the same subnet
- **When:** 2026-07-14
- **What happened:** After first boot, WAN auto-assigned `192.168.1.47/24` from the home router via DHCP, but LAN was still sitting on pfSense's factory default of `192.168.1.1/24` - the same `/24` as WAN.
- **Root cause:** Didn't reconfigure LAN's default address before/immediately after first boot; the factory default just happens to collide with a common home router range (`192.168.1.0/24`).
- **Fix:** Used console option 2 (Set interface IP address) to move LAN to its own subnet, `192.168.2.1/24`.
- **Talking point:** Overlapping subnets between two interfaces on the same router breaks routing in ways that aren't always obvious immediately - this is a real basic networking concept (can't have two interfaces authoritative for the same address space) that shows up in interviews.

<a id="err-lan-dhcp-client-mixup"></a>
### LAN interface accidentally set to DHCP client instead of static
- **When:** 2026-07-14, fixed 2026-07-15
- **What happened:** Re-running the LAN IP wizard to fix the subnet conflict above, the console prompt "Configure IPv4 address LAN interface via DHCP? (y/n)" got answered (or misread) in a way that left LAN configured as a DHCP *client* rather than the intended static `192.168.2.1`. Session ended before it was caught.
- **Root cause:** Moved through the wizard too fast without confirming each prompt's actual question before answering - plus general unfamiliarity with the difference between "this interface requests an address" (DHCP client) vs "this interface hands out addresses" (DHCP server), which get asked as separate, similarly-worded prompts later in the same wizard.
- **Fix:** Reran the wizard from scratch the next session, answering **n** to the DHCP-client prompt, entering the static address (`192.168.2.1`) and subnet bit count (`24`) as two separate manual entries, leaving the LAN gateway prompt blank, then separately answering **y** to the *DHCP server* prompt later on (a different question - this one's correct to enable).
- **Talking point:** Good example of a subtle but critical distinction in network config UIs - "this box requests an IP" vs "this box gives out IPs" sound similar in a fast-scrolling console wizard but are opposite roles. Worth calling out explicitly in the writeup since it's the kind of thing that trips up people new to routers/firewalls specifically because the prompts are worded so similarly.

<a id="err-dhcp6-vs-dhcp-server-confusion"></a>
### Confusion over IPv6 DHCP6 (client) vs DHCP server (IPv4) prompts
- **When:** 2026-07-15
- **What happened:** Mid-wizard, got confused about why "Configure IPv6 address LAN interface via DHCP6?" should be answered **n** while a few prompts later "Do you want to enable the DHCP server on LAN?" should be answered **y** - they read as contradictory at a glance.
- **Root cause:** Same client-vs-server distinction as above, just for a different protocol version, and the two questions are close enough in wording that it's not obvious they're asking opposite things.
- **Fix:** Walked through the distinction explicitly before answering: DHCP6 client role = pfSense asking someone else for an IPv6 address (nothing to ask, and IPv6 isn't used in this lab, so **n**); DHCP server role = pfSense handing out IPv4 addresses to future VMs on the LAN (needed, so **y**).
- **Talking point:** Same lesson as the entry above, reinforced - worth writing up once, clearly, since it came up twice in two days.

<a id="err-vmbr1-ip-silent-noop"></a>
### Proxmox UI reported the `vmbr1` IP edit applied, but it never actually wrote to config
- **When:** 2026-07-16
- **What happened:** Edited `vmbr1` in the Proxmox web UI to add an IPv4 address (`192.168.2.2/24`) so the host could reach the lab's internal subnet, then clicked Apply Configuration. No error, no visible network drop. But `ping` from the host to both pfSense (`192.168.2.1`) and Wazuh (`192.168.2.100`) over that bridge timed out completely.
- **Root cause:** Checked `/etc/network/interfaces` directly and found `vmbr1` was still `iface vmbr1 inet manual` with no address line at all - the UI edit silently never got written to the actual config file, despite reporting success.
- **Fix:** Edited the file directly with `nano`, changed the stanza to `inet static` with `address 192.168.2.2/24`, then ran `ifreload -a` to apply live without a reboot. Confirmed with `ip addr show vmbr1` and a successful ping to both `.1` and `.100`.
- **Talking point:** Same "verify actual state, not just exit code / lack of error" lesson as the CPU scaling governor mistake - except this time the failure mode was a UI silently no-op'ing instead of picking the wrong option. Worth checking `/etc/network/interfaces` directly after any bridge/network edit through the Proxmox UI when something downstream doesn't behave as expected, rather than trusting "no error shown" as proof the change took.

<a id="err-pfsense-wan-rfc1918-block"></a>
### First web GUI login auto-launched the Setup Wizard, and its WAN default would have blocked the home network
- **When:** 2026-07-16
- **What happened:** The very first web GUI login to pfSense (only just reachable via the new SOCKS proxy) automatically launched pfSense's Setup Wizard. On the WAN interface page, "Block RFC1918 Private Networks" was checked by default.
- **Root cause:** That setting assumes WAN is a true public-internet-facing interface. In this build, pfSense's WAN sits behind the home router doing NAT, so WAN's own address is itself a private `192.168.1.x` address - leaving RFC1918 blocking on would filter out the home router's own private-range traffic, effectively cutting WAN off from the network it depends on.
- **Fix:** Unchecked "Block RFC1918 Private Networks" on the WAN page before continuing. Left "Block bogon networks" checked, since that only filters genuinely unallocated public internet ranges and isn't affected by the double-NAT setup here.
- **Talking point:** pfSense's wizard defaults assume it's sitting directly on the public internet. Any "router behind a router" home lab build - this one, or literally any pfSense box behind an ISP modem - needs this unchecked, or WAN silently blocks itself. Worth calling out since it's an easy default to blow past without reading it, and it's specifically documented as a gotcha in pfSense's own home/lab guidance.

<a id="err-pfsense-rule-logging-default-off"></a>
### Pass rules matched traffic correctly but logged nothing - logging isn't on by default
- **When:** 2026-07-19
- **What happened:** While verifying that pfSense was actually routing (and could eventually log) traffic between the new ATTACK and TARGET VLANs, a successful ping between them produced zero matching entries in Status > System Logs > Firewall - only unrelated WAN mDNS/broadcast noise showed up, even though the ping itself worked (proving pfSense *was* routing it).
- **Root cause:** pfSense's Pass rules don't log their matches by default - logging is an explicit per-rule checkbox ("Log packets that are handled by this rule"), separate from the rule actually functioning. A rule can be 100% correctly configured and passing real traffic while producing zero log output.
- **Fix:** Edited both the ATTACK and TARGET Pass rules to check the logging box, applied, then re-ran the ping - the crossing then appeared correctly tagged under each VLAN's interface name in the firewall log.
- **Talking point:** "It's working" and "it's observable" are two different properties of a firewall rule, and conflating them cost real debugging time here - assumed silence in the log meant the traffic wasn't crossing, when actually the traffic was fine and only the visibility was missing. Directly relevant to a SOC/blue-team mindset: a permissive rule with logging off is a real blind spot, not just a lab inconvenience.

---

## Proxmox VLAN Segmentation (Session 5 prep)

<a id="err-vlan-aware-bridge-no-port"></a>
### VLAN-aware bridge checkbox didn't actually prevent VMs from starting until it did - "no physical interface on bridge"
- **When:** 2026-07-19
- **What happened:** Enabled "VLAN aware" on `vmbr1` via the Proxmox GUI (Datacenter/node > System > Network > edit `vmbr1`) to support tagging Kali and Metasploitable onto separate VLANs (10/20) behind pfSense. Applied with no error shown. Tagged Kali's and Metasploitable's Network Devices with VLAN Tag 10/20, tried to start them - both failed immediately with `kvm: -netdev ...: network script /usr/libexec/qemu-server/pve-bridge failed with status 65280` and `no physical interface on bridge 'vmbr1'` in the task log.
- **Root cause:** Two things stacked. First, `vmbr1` was deliberately built back on 2026-07-13 with zero real ports (`bridge-ports none`) - it's a pure internal virtual switch, pfSense/Wazuh/etc. only attach to it as VM taps, not physical NICs. A VLAN-aware Linux bridge needs at least one *real* port to anchor its VLAN table before it can accept a tagged tap interface - with zero real ports, the very first tagged VM to attach hits this chicken-and-egg failure. Second, checking `/etc/network/interfaces` directly showed `vmbr1` had no `bridge-vlan-aware`/`bridge-vids` lines at all despite the GUI reporting the change applied - same silent-no-op pattern as the [vmbr1 static-IP entry above](#err-vmbr1-ip-silent-noop), where the Proxmox UI reports success without actually persisting the write to the config file.
- **Fix:** Added a harmless `dummy0` dummy-type interface directly in `/etc/network/interfaces` and set it as `vmbr1`'s `bridge-ports` (instead of `none`), keeping `bridge-vlan-aware yes` and `bridge-vids 2-4094` explicitly in the same stanza, then applied live with `ifreload -a` (no host reboot). Verified with `bridge link show` that `dummy0` showed up with `master vmbr1`. VMs then started cleanly onto their tagged VLANs.
- **Talking point:** Two lessons stacked into one incident - (1) a VLAN-aware Linux bridge is a different beast from a plain switching bridge and has its own real-port requirement that isn't obvious from the GUI checkbox alone, a genuine 802.1Q/Linux-networking nuance worth knowing cold for an interview; (2) yet another instance of the Proxmox web UI silently not writing a bridge config change to disk despite reporting success - by this point in the build, "verify `/etc/network/interfaces` directly after any bridge edit, don't trust the UI's success message" is a fully earned habit, not a one-off fluke.

<a id="err-pfsense-stale-trunk-port"></a>
### pfSense's own VLAN traffic went completely silent - a running VM's bridge port doesn't refresh itself
- **When:** 2026-07-19
- **What happened:** After fixing the bridge above, Kali and Metasploitable both booted and pulled DHCP leases fine on their own VLANs - but neither could actually reach pfSense: DHCP requests timed out with `nmcli`'s "IP configuration could not be reserved," and pfSense's own DHCP/system logs showed absolutely nothing arriving, not even a rejected request.
- **Root cause:** pfSense had been running continuously since long before `vmbr1` became VLAN-aware. Its own tap interface attached to the bridge back when it was a plain, non-filtering switch, where 802.1Q tags pass through as opaque bytes and nobody cares about port roles. The moment the bridge became VLAN-aware, every port needed an explicit trunk/access assignment - but that assignment is only made by Proxmox at the moment a NIC attaches, which for a VM that's been up the whole time simply never happens again on its own.
- **Fix:** Rebooted the pfSense VM. That forced its tap to detach and reattach fresh under the now-VLAN-aware bridge, at which point Proxmox correctly set it up as a trunk port (its own Network Device had no VLAN Tag set, which is what makes a port trunk instead of access). DHCP requests from both VLANs succeeded immediately after.
- **Talking point:** A live config change to shared infrastructure (the bridge) doesn't retroactively apply to things already plugged into it - only to new connections. The general version of this shows up constantly in real networking/ops work: changing a switch's trunk config doesn't help a device whose port session predates the change until that port bounces. Worth explicitly checking "does anything currently attached need to reconnect for this to take effect?" after any shared-infrastructure change, not just confirming the change itself saved correctly.

<a id="err-pfsense-syslogd-dead-after-boot"></a>
### pfSense's firewall log went completely silent - `syslogd` itself wasn't running
- **When:** 2026-07-20
- **What happened:** Picking Session 5 back up, pfSense's Firewall log page (Status > System Logs > Firewall) showed nothing newer than an hour-old timestamp, even after generating fresh Kali-to-Metasploitable traffic and hard-reloading the page. `Diagnostics > States` confirmed pfSense *was* correctly routing the traffic (real `ESTABLISHED`/`FIN_WAIT_2` states existed for it), and the Pass rule itself was correctly configured with logging on - so the rule and routing were never the problem.
- **Root cause:** Checked the raw log file directly (`tail /var/log/filter.log` via Diagnostics > Command Prompt) and found only a single `newsyslog` rotation line from earlier, nothing since. `ps aux` confirmed `filterlog` (the process that reads matched packets off `pflog0`) was alive, but `syslogd` - the actual daemon that writes those events to `/var/log/filter.log` - wasn't running at all. Its start time never lined up with `filterlog`'s or `dhclient`'s (both from when the VM booted this session), meaning `syslogd` most likely failed to start cleanly during boot rather than crashing mid-session - plausibly a startup-order race (VLAN sub-interfaces or the remote syslog target not ready yet when it tried to start) or memory pressure from pfSense's fairly lean 1GB RAM allocation now juggling VLANs plus remote syslog forwarding.
- **Fix:** `killall -HUP syslogd` didn't work (no such process existed yet - "no matching processes"), which is what confirmed it was actually dead rather than just needing a reopen signal. Started it fresh with `/etc/rc.d/syslogd start`, confirmed via `ps aux | grep syslogd` that a real `/usr/sbin/syslogd -s` process existed, then re-tested with a ping from Kali - the crossing showed up correctly in `filter.log` within seconds.
- **Talking point:** A great example of methodically bisecting a "logs aren't showing up" problem instead of guessing: checked routing (states table) first, then rule config (GUI), then the raw log file, then the actual process list - each step ruled out one layer until the real gap (a dead daemon, not a bad setting) was isolated. Also a genuinely interesting root cause for an interview: log rotation can be the *symptom* that surfaces an already-dead logging daemon, not the cause of one. Follow-up item added to Status.md: check `ps aux | grep syslogd` on pfSense after every fresh boot of the lab, since this looks like a per-boot startup race rather than a one-off fluke.

---

## Kali Networking

<a id="err-kali-networkmanager-dhcp"></a>
### `dhclient` doesn't exist on modern Kali - and the interface was sitting disconnected, not just address-less
- **When:** 2026-07-19
- **What happened:** After moving Kali onto its new VLAN, `ip a` showed `eth0` up but with only an IPv6 link-local address, no IPv4. The instinct was to force a DHCP renewal with `sudo dhclient eth0` - which returned `command not found`.
- **Root cause:** Modern Kali (like most current Debian-based desktop distros) manages networking through NetworkManager, not the older `isc-dhcp-client` toolset `dhclient` belongs to - that package isn't installed by default anymore. Separately, `nmcli device status` showed the interface as `disconnected`, a NetworkManager-specific state that a raw `dhclient` command wouldn't have addressed anyway even if it existed.
- **Fix:** Used NetworkManager's own tooling instead: `nmcli device status` to see the real state, then `sudo nmcli device connect eth0` to bring it up and trigger a fresh DHCP request (which, at that point, still failed until the [pfSense stale trunk port](#err-pfsense-stale-trunk-port) issue above was separately fixed).
- **Talking point:** Reaching for a remembered command from an older or different Linux networking stack (`dhclient`, `ifconfig`-only habits, etc.) without checking what the current distro actually uses is an easy trap - `nmcli device status` / `nmcli device connect` is the modern equivalent worth knowing directly, not just "the fix that happened to work here."

---

## Wazuh Install

<a id="err-wazuh-stale-install-url"></a>
### Install script URL was stale - downloaded an XML error page instead of the script
- **When:** 2026-07-15/16
- **What happened:** Ran `curl -sO https://packages.wazuh.com/4.x/wazuh-install.sh` (the generic `/4.x/` path from earlier notes/docs). The download succeeded with no error, but running `sudo bash ./wazuh-install.sh -a` immediately threw `syntax error near unexpected token 'newline'`, and the file's first line was `<?xml version="1.0" encoding="UTF-8"?>` - not a shell script at all.
- **Root cause:** Wazuh's package host no longer serves a generic `/4.x/` path - it's version-pinned now (`/4.14/` at the time of this build). The generic path returned an S3/CDN-style XML error response, and `curl -sO` saved that response body under the expected filename with no visible error, so the failure was completely silent until execution.
- **Fix:** Checked Wazuh's current quickstart docs, corrected the URL to `https://packages.wazuh.com/4.14/wazuh-install.sh`, re-downloaded, sanity-checked with `head -5 wazuh-install.sh` before running it (confirmed it looked like real shell script content, not XML), then ran the installer.
- **Talking point:** Never trust that a download succeeded just because `curl` didn't error - a failed/redirected download can still return HTTP 200 with a small error payload saved under the exact filename you expected. Worth a quick `head` or file-type check before executing anything fetched from the internet, especially before piping into `bash` with root privileges. Same root cause as the earlier "trust the filename" pfSense `.iso.gz` mistake - different symptom, same lesson.

---

## Ubuntu Server (Containers) / Docker

<a id="err-fancy-dash-hostname-filename"></a>
### Pasted hyphen wasn't a real hyphen - broke the VM name field and a filename reference
- **When:** 2026-07-17
- **What happened:** Typing/pasting `ubuntu-containers` into Proxmox's VM-name field threw "not a valid hostname." Later in the same session, `ls -la get-docker.sh` found the file fine, but `wc -l get-docker.sh` immediately after said "no such file or directory" for the same filename.
- **Root cause:** A copy-pasted hyphen character isn't guaranteed to be the plain ASCII `-` (0x2D) - a typographic/en-dash look-alike from a source that auto-corrects dashes (chat apps, some editors) is invisually identical but a different byte, and both Proxmox's hostname validation and the shell treat it as a different character/filename entirely.
- **Fix:** Renamed the VM without a hyphen (`ubuntucontainers`) to sidestep it. For the file, since Proxmox's noVNC console doesn't support Tab-completion, retyped the filename by hand from the keyboard instead of pasting it a second time - guarantees a real hyphen.
- **Talking point:** A classic invisible-character bug - two strings that render identically on screen but aren't byte-equal, which is exactly the kind of thing that costs 20 minutes of confused troubleshooting. Worth generalizing: when copy-pasting into a terminal or hostname field produces a baffling "not found" error on something that visually looks correct, suspect a smart-quote/smart-dash substitution before anything else.

---

## Metasploitable 2 Import

<a id="err-metasploitable-boot-order"></a>
### Imported disk attached as ide2 (or left unchecked) - VM boot-looped on "no bootable device"
- **When:** 2026-07-18
- **What happened:** After `qm importdisk`-ing Metasploitable's `.vmdk` into `local-lvm` and attaching the resulting Unused Disk, the VM booted into a fast, repeating "no bootable device" loop instead of reaching the OS.
- **Root cause:** In the VM's Options > Boot Order dialog, the actual disk (`ide0`, 8GB on local-lvm) was left **unchecked**, while `ide2` (the empty CD/DVD slot) and `net0` (network/PXE boot) were checked instead - neither has anything to boot from, so SeaBIOS just cycled through both forever.
- **Fix:** Opened Boot Order, checked `ide0` specifically, dragged it to the top of the list above ide2/net0, saved, restarted the VM - booted straight to the `msfadmin` login prompt.
- **Talking point:** Attaching an imported/unused disk doesn't automatically mark it bootable - Proxmox's boot order defaults can leave the real disk unchecked while leaving stale CD-ROM/network entries checked instead. Same root lesson as the earlier "verify actual state, don't assume the UI did what you expected" entries above - check Boot Order explicitly after importing any disk, don't just attach and hit Start.
- **Also confirmed:** old pre-VirtIO images like Metasploitable 2 (Ubuntu 8.04 / 2.6.x kernel) need the disk attached as **IDE**, not SCSI/VirtIO - the guest has no VirtIO drivers to see a SCSI/VirtIO-attached disk at all.

---

## Wazuh Configuration

<a id="err-wazuh-logall-disabled"></a>
### Firewall logs were confirmed working end-to-end, but Wazuh's own archive was silently empty
- **When:** 2026-07-19
- **What happened:** After fixing the VLAN routing, the stale pfSense trunk port, and pfSense's own rule logging, a cross-VLAN ping still produced nothing in Wazuh's `/var/ossec/logs/archives/archives.log` - not even a hint that a syslog packet had arrived, despite three separate layers of the pipeline all confirmed independently correct by that point.
- **Root cause:** `ossec.conf`'s `<global>` block had `<logall>no</logall>` and `<logall_json>no</logall_json>` - Wazuh's default posture. By design, Wazuh only writes to `archives.log` when this is explicitly turned on; otherwise it only logs events that trigger an actual alert rule, which raw forwarded firewall traffic doesn't do on its own. Every earlier layer (pfSense routing, pfSense logging, syslog delivery) had genuinely been working the whole time - this was the true last-mile gap.
- **Fix:** Set both `<logall>yes</logall>` and `<logall_json>yes</logall_json>` in `ossec.conf`, restarted `wazuh-manager`, and re-ran the ping - the forwarded pfSense entries showed up in `archives.log` immediately.
- **Talking point:** The most expensive kind of debugging is chasing a symptom across multiple genuinely-broken layers when only the last one actually matters - three real, separate bugs (VLAN bridge, stale trunk port, rule logging) all got found and fixed correctly, and the pipeline *still* looked broken until this one setting was checked. Worth internalizing as a general SIEM/log-pipeline lesson: "alerts only" vs "full archive" is a fundamental Wazuh (and broader SIEM) distinction, and it's off by default specifically because full archiving is expensive at scale - a real, defensible design choice to explain in an interview, not just a gotcha.

<a id="err-wazuh-filebeat-archives-disabled"></a>
### Archives were writing to disk on the Wazuh VM the whole time, but the dashboard had nothing to show - a second, separate "off by default" switch
- **When:** 2026-07-20
- **What happened:** Picking Session 5 back up, tried to view the archived pfSense logs in the Wazuh dashboard itself (not over SSH like last session) and hit a wall creating an index pattern for `wazuh-archives-*` - typing the name into Stack/Dashboards Management > Index Patterns showed zero matching indices at all, as if no archive data existed anywhere.
- **Root cause:** The 2026-07-19 fix (`logall`/`logall_json: yes` in `ossec.conf`) only controls whether the Wazuh **manager** writes archives to its own local flat file (`/var/ossec/logs/archives/archives.log`) - confirmed working via `tail -f` last session. Getting that same data actually **indexed into OpenSearch** (so the dashboard can query it) is a separate, second switch: Filebeat's own module config (`/etc/filebeat/filebeat.yml`, under `filebeat.modules > module: wazuh > archives > enabled`), which defaults to `false` independently of the manager-side setting. Two different components, two different "off by default" archive toggles, each guarding a different hop of the same pipeline.
- **Fix:** Edited `/etc/filebeat/filebeat.yml` on the Wazuh VM, flipped `archives.enabled` from `false` to `true`, restarted Filebeat (`sudo systemctl restart filebeat`). Verified the new index actually got created with `curl -k -u admin:<pw> https://127.0.0.1:9200/_cat/indices?v | grep archives` (note: had to use `127.0.0.1`, not the VM's LAN IP - the indexer only listens on localhost by default). Index pattern creation in the dashboard then found `wazuh-archives-4.x-2026.07.20` immediately, already containing hundreds of documents that had been piling up server-side the whole time.
- **Talking point:** Directly extends the 2026-07-19 `logall`/`logall_json` lesson rather than being a brand-new category of mistake - "the data exists on disk" and "the dashboard can see it" turned out to be two more independently-gated steps in the same pipeline, same as manager-writes-to-file vs. manager-writes-an-alert were. A real, generalizable SIEM lesson: assume every hop between "event happened" and "analyst sees it on a screen" has its own separate on/off switch, and verify each one directly (raw file, then indexer API, then dashboard) rather than assuming the whole chain is one setting.

---

## Windows Server 2022 VM Setup

<a id="err-ovmf-secureboot-old-cert-red-herring"></a>
### OVMF/Secure Boot cert mismatch theory - plausible, but not the actual root cause
- **When:** 2026-07-22
- **What happened:** First boot of the `winserver` VM (OVMF/UEFI BIOS, TPM enabled, per Proxmox's default suggestion for the "Windows 11/2022" guest OS type) failed with `BdsDxe: failed to load Boot0002/Boot0003 ... Not Found` for both the hard disk (expected, it's blank) and the CD-ROM (not expected - a properly attached, correctly-sized ISO should be found). Diagnosed this as Secure Boot rejecting the ISO's boot loader, since Proxmox's EFI Disk only pre-enrolls the newer `ms-cert=2023k` certificate set and the downloaded ISO's build (20348.1, mid-2021) predates that cert. Switched the VM to legacy SeaBIOS and removed the EFI Disk/TPM State devices to route around it entirely.
- **Root cause:** Actually a wrong ISO file (see the entry directly below) with no boot code on it at all - the "Not Found" symptom under OVMF is consistent with both a Secure Boot rejection *and* a genuinely non-bootable disc, and the second, unrelated bug (wrong file) was sitting underneath the whole time. The SeaBIOS switch didn't fix anything by itself; it just happened to run in parallel with fixing the real issue.
- **Fix:** None needed for OVMF specifically - Windows Server doesn't require UEFI/Secure Boot/TPM (unlike Windows 11 desktop, which enforces it), so SeaBIOS is a perfectly valid, simpler choice to just keep rather than reverting back.
- **Talking point:** A real lesson in *failure mode ambiguity* - two different root causes (a cert policy mismatch vs. a non-bootable file) can produce an identical-looking generic firmware error. The fix here is process, not luck: when one plausible theory is being chased, actively look for a second one before committing time to a fix, especially when the "fix" (switching firmware/BIOS mode entirely) is a much bigger change than the symptom obviously requires.

<a id="err-microsoft-eval-center-two-iso-links"></a>
### Grabbed the wrong Windows Server ISO - Microsoft's own download page has two similarly-named links
- **When:** 2026-07-22
- **What happened:** Downloaded what looked like the Windows Server 2022 evaluation ISO from Microsoft's Evaluation Center and spent a full round of VM boot troubleshooting (see entry above) before actually reading the filename closely: `...SERVER_LOF_PACKAGES_OEM.iso`. This is the **Languages and Optional Features (LOF)** ISO - a real, legitimate Microsoft product, but meant to be mounted inside an *already-installed* Windows Server to add language packs/Features on Demand offline. It has no OS installer or boot code on it at all.
- **Root cause:** The Evaluation Center's overview page for Windows Server 2022 has two separate download links stacked close together: a plain **"ISO"** link near the top (in the "Overview" paragraph, explicitly for the LOF package) and a **"Download the ISO"** link further down (under "Get started for free," the actual installer). Nothing visually distinguishes them at a glance, and the filename difference is the only real signal something's wrong - easy to miss when you're not expecting a page to offer two different "ISO" downloads for the same product.
- **Fix:** Went back to the same page, this time using the **"Download the ISO"** link specifically under "Get started for free," confirmed the new filename contained `SERVERSTANDARDEVAL`/`SERVERDATACENTEREVAL` (no `LOF`/`PACKAGES`/`OEM`/`METADATA`), re-uploaded, swapped into the VM's CD/DVD drive.
- **Talking point:** The actual, avoidable time cost here wasn't the mistake itself - it was not reading the filename that was already visible on screen (in a Hardware-tab screenshot) for several messages before it got flagged. Directly prompted a new standing practice ([[configgoat skill]]): read every filename/version string/detail a screenshot shows in full, immediately, rather than skimming past it while chasing a more technically interesting theory.

<a id="err-winserver-cd-reboot-restart-loop"></a>
### Pressed a key at "Press any key to boot from CD or DVD" mid-install, relaunched Setup from scratch
- **When:** 2026-07-24
- **What happened:** After the 2026-07-23 session's install was interrupted (daily-driver laptop's battery died mid-check over the SSH tunnel), a fresh install was started. Partway through - after the file-copy phase, on Setup's own automatic reboot - the familiar "Press any key to boot from CD or DVD" prompt reappeared. Pressed a key out of habit, which re-booted the ISO and relaunched Windows Setup from the very beginning instead of letting the partially-installed OS continue booting from `sata0`.
- **Root cause:** The instruction to "press a key within ~2 seconds" only applies to the *very first* boot, when the disk is empty and the ISO is the only bootable thing available. On every subsequent reboot during the same install, the ISO is still attached on `ide2` with boot order still listing it above `sata0` (correct for boot #1), but the disk now has a real, further-along Windows install on it - so pressing a key at that same prompt on reboot #2+ re-triggers the installer instead of continuing, silently discarding all progress with no error message.
- **Fix:** Restarted the VM and let the fresh attempt run again, this time doing nothing at all when the prompt reappears on any reboot after the first - letting it time out falls through to `sata0` and Setup resumes normally.
- **Talking point:** A single UI prompt with two opposite correct answers depending on which boot cycle you're on, and nothing on screen distinguishes them - the fix is entirely procedural (know it's coming, do nothing) rather than anything configurable in the VM itself. Same category as [[err-pfsense-early-eject]]: an action that's correct at one point in an install and destructive moments later, purely a timing trap.

<a id="err-winserver-ctrlaltdel-console-intercept"></a>
### Lock screen after first boot looked unresponsive - physical Ctrl+Alt+Del never reached the VM
- **When:** 2026-07-24
- **What happened:** Right after setting the local Administrator password on first boot, `winserver` dropped to a "Press Ctrl+Alt+Del to unlock"-style screen. Pressing the physical key combo did nothing, initially read as a stuck screensaver.
- **Root cause:** Browser-based VM consoles (Proxmox's noVNC, vSphere console, etc.) can't receive Ctrl+Alt+Del as a real keystroke - the browser or host OS intercepts it before it ever reaches the VM. This is a universal limitation of the console type, not anything specific to this build.
- **Fix:** Used the console's dedicated "Ctrl+Alt+Del" button (in the noVNC sidebar / Proxmox's console toolbar) instead of the physical keys - sends the actual signal directly to the VM.
- **Talking point:** Same root shape as the noVNC clipboard issue already logged ([[err-novnc-clipboard-multiline]]) - anything that relies on the host OS intercepting a signal (clipboard, reserved key combos) doesn't cross a browser-based console cleanly, and every remote-console tool ships a workaround for exactly this reason.

---

## Wazuh Agent Deployment (Session 7 / Build Log 06)

<a id="err-attack-vlan-inbound-blocked"></a>
### SSH to Kali from the management side hung - ATTACK VLAN's pass rule only allows outbound, not inbound
- **When:** 2026-07-29
- **What happened:** Tried `ssh -J root@192.168.1.219 kye@192.168.10.100` (Proxmox host as jump box) to reach Kali for the Session 7 Wazuh agent install - same pattern that worked reaching Wazuh back in Session 5. It just hung with no output or error at all.
- **Root cause:** Verified both directions independently before concluding anything. `systemctl status ssh` on Kali (via console) showed the service genuinely `active (running)`, ruling out "SSH not enabled" (the usual modern-Kali gotcha where sshd isn't started by default). Then `ping -c 3 192.168.2.100` **from** Kali succeeded clean (0% loss), proving outbound traffic from the ATTACK VLAN to the LAN works fine. The only thing left was the reverse direction: the ATTACK VLAN's pfSense pass rule, built in Session 5 specifically to let Kali's exploit traffic reach Metasploitable, was scoped for that traffic's direction only - nothing was ever added to permit the management network (or the Proxmox host, which has no interface on VLAN 10 at all) initiating a connection *into* the ATTACK VLAN.
- **Fix:** Didn't open a new pfSense rule for this - not worth widening the ATTACK VLAN's exposure just to enable an SSH workflow the existing Proxmox noVNC console already covers for occasional work. Did the rest of Session 7 through the console instead.
- **Talking point:** Firewall/VLAN rules are directional by nature - "the service is confirmed running" plus "outbound traffic from that host works" doesn't imply inbound works too. A genuinely good SOC/network-role habit: test both directions independently before concluding a rule problem, rather than assuming a working ping in one direction means the path is symmetric.

<a id="err-wazuh-agent-retyped-console-commands"></a>
### Three separate typos retyping Wazuh's wizard-generated install command by hand into a VM console
- **When:** 2026-07-29
- **What happened:** Wazuh's dashboard "Deploy new agent" wizard generates a correct, version-matched install command, but it still has to be retyped by hand into the target VM's console (Proxmox's noVNC clipboard has been unreliable before, so pasting wasn't trusted here either). Across the Kali and `winserver` installs, three distinct single-character typos each produced a different, non-obvious error: a comma instead of a period in `4.x` (`Invoke-WebRequest : Cannot convert 'System.Object[]' to the type 'System.Uri'` - PowerShell parses a bare comma as an array separator), a period instead of a hyphen in the version filename (`wazuh-agent-4.14.6.1.msi` vs. the real `wazuh-agent-4.14.6-1.msi`, returning a misleading `403 Forbidden` instead of a clean 404 for a path that simply doesn't exist), and `%env:tmp` instead of `$env:tmp` (`Cannot find drive` - PowerShell tried to resolve `%env` as a PSDrive name).
- **Root cause:** Manually retyping a generated command is inherently error-prone character-by-character, and none of these three error messages point directly back at "you mistyped a character" - each looks like a real infrastructure/permissions/syntax problem until the retyped command is compared side-by-side against the original.
- **Fix:** Caught all three by comparing the exact retyped text against the wizard's original output character-by-character, rather than re-guessing at the error message's surface meaning.
- **Talking point:** Extends the existing "read every filename/detail already shown in full" habit ([[err-microsoft-eval-center-two-iso-links]]) one step further - it's not enough to read the *original* generated text carefully once, the retyped copy needs the same scrutiny, since the console (not the source) is where the actual typo gets introduced. A `403` for a wrong path vs. a `404`, and a drive-not-found error for a wrong sigil, are both "the error message describes a plausible but different problem" traps worth recognizing on sight.

---

## Kerberoasting (Build Log 06)

<a id="err-bash-history-expansion-password"></a>
### `invalidCredentials` on a correct password - bash was mangling it before it left the shell
- **When:** 2026-08-10
- **What happened:** Ran `impacket-GetUserSPNs -dc-ip 192.168.2.105 HOMELAB.LOCAL/Administrator:<password> -request` from Kali with the real, correct Administrator password and got `[-] Error in bindRequest -> invalidCredentials` back from the DC.
- **Root cause:** The password contains a `!`. Left unquoted (or even inside double quotes) in bash/zsh, `!` triggers history expansion - the shell rewrites it before the command ever runs, so Impacket receives a mangled string that isn't the real password at all. The DC was correctly rejecting garbage, not the actual credential.
- **Fix:** Wrapped the entire `domain/user:pass` argument in single quotes: `'HOMELAB.LOCAL/Administrator:k74202644!'`. Single quotes are the one quoting style bash won't expand anything inside of, including `!`, `$`, and backticks.
- **Talking point:** A textbook case of a security tool correctly rejecting bad input while the actual bug was one layer up, in shell interpretation, not the credential or the target. Worth the reflex any time a password with special characters gets passed on a command line: single-quote it by default, don't wait for the error.

<a id="err-auditpol-trailing-space"></a>
### `auditpol` rejected an exact-looking subcategory name - one invisible trailing space
- **When:** 2026-08-10
- **What happened:** `auditpol /set /subcategory:"Kerberos Service Ticket Operations " /success:enable` (note the space before the closing quote) failed with `Error 0x00000057: The parameter is incorrect`, dumping the full usage help instead of a specific complaint about the subcategory name.
- **Root cause:** `auditpol` matches subcategory names exactly. A stray space inside the quotes - invisible at a glance, easy to introduce retyping a command instead of copy-pasting it - made `"Kerberos Service Ticket Operations "` fail to match any real subcategory, and the tool's generic parameter-error message gave no hint which part was wrong.
- **Fix:** Retyped the command with the closing quote immediately after `Operations`, no trailing space. Ran clean, no error.
- **Talking point:** Same family as the earlier fancy-dash/retyped-command mistakes elsewhere in this build ([[err-wazuh-agent-retyped-console-commands]]) - CLI tools that do exact string matching on human-facing names are unforgiving of whitespace a person would never notice, and the resulting error rarely names the actual problem.

<a id="err-wazuh-4769-targetusername-vs-servicename"></a>
### Searched the wrong field hunting for the Kerberoasted account in Wazuh
- **When:** 2026-08-10
- **What happened:** Spent real time filtering Wazuh Discover for `data.win.eventdata.targetUserName: svc-sql` (the Kerberoasted service account) and got nothing back, across multiple time ranges and query syntaxes.
- **Root cause:** In a Windows 4769 (Kerberos Service Ticket Operation) event, `TargetUserName` is the account that *requested* the ticket (in this case `Administrator`, since that's who authenticated to run the attack) - Windows' own event schema just names the field misleadingly. The account actually being ticketed, `svc-sql`, lives in a different field entirely: `serviceName`.
- **Fix:** Filtered on `data.win.eventdata.serviceName: svc-sql` instead. (Separately, this specific event turned out not to be reaching Wazuh at all - a real, still-open SIEM visibility gap, not a search-syntax problem - see Status.md's 2026-08-10 log entry.)
- **Talking point:** Windows' own Security event schema is a real source of confusion independent of any tooling around it - "TargetUserName" reads like "the target of the action" but actually means "the subject being audited," which for a ticket-request event is the requester, not the resource. Worth knowing cold before ever hunting Kerberoasting in a SIEM: `serviceName`/`ServiceName` is the field that names the account under attack, not `targetUserName`/`TargetUserName`.

<a id="err-wazuh-stale-index-pattern-field-cache"></a>
### The Kerberoasting event was actually being collected the whole time - a stale dashboard field cache was hiding it
- **When:** 2026-08-10
- **What happened:** After ruling out Windows auditing (confirmed via `Get-WinEvent` directly on `winserver`), rule-matching/alert thresholds (switched from `wazuh-alerts-*` to `wazuh-archives-*`, still 0 hits), and agent-side config filtering (`ossec.conf`'s EventID exclusion query doesn't include 4769) - the `svc-sql` event still wasn't showing up anywhere, across three separately-verified layers of the pipeline.
- **Root cause (two contributing candidates, not fully separated):** the `wazuh-archives-*` index pattern's field list had never been manually refreshed in the dashboard, so `data.win.eventdata.serviceName` wasn't registered as a filterable field yet - it didn't even appear in the field picker. This may have caused earlier filtered searches to silently return false "0 hits" rather than a genuine absence. Separately, the Wazuh agent's live Windows Event Log subscription is known to be able to miss events fired in a tight burst too close to an agent restart - and the failed searches happened to always follow a recent agent restart. Refreshing the field cache and re-running the attack with the agent long stable both happened at the same time, so which one actually mattered (or if both did) isn't cleanly isolated.
- **Fix:** Stack Management > Index Patterns > `wazuh-archives-*` > refresh field list. Re-ran the identical attack with the agent well past any restart. The event appeared cleanly, 4 hits, on the very next check.
- **Talking point:** The most expensive assumption in this entire session was trusting that "0 hits" meant "the event isn't there" without first confirming the query itself was even capable of matching it. A dashboard's cached field list is one more hidden layer between "the data exists" and "the query can find it" - the same category of lesson as [[err-wazuh-logall-disabled]] and [[err-wazuh-filebeat-archives-disabled]] before it: assume every hop between an event happening and an analyst seeing it has its own independent way to silently fail, and verify the tooling itself before concluding the data doesn't exist.

---

## Log
- **2026-07-15** - File created, backfilled with errors from the 2026-07-12 through 2026-07-15 sessions (scaling governor mistake, gzip ISO confusion, failed install/stuck VM, subnet conflict, DHCP client/server mixup). Update this file live going forward as new issues come up, rather than reconstructing from memory later.
- **2026-07-17** - Added an entry from the Ubuntu Server/Docker build session: the pasted-hyphen/invisible-character bug (VM name field + `get-docker.sh` filename mismatch).
- **2026-07-25** - Removed the "deployed containers before verifying they'd actually been run" entry - turned out to be a session-note mixup, not a real build mistake, once double-checked against what actually happened.
- **2026-07-18** - Added the Metasploitable 2 boot-order entry (imported disk left unchecked in Boot Order while empty CD-ROM/network entries were checked, causing a boot loop until `ide0` was explicitly checked and reordered to the top).
- **2026-07-18/19** - Added the noVNC-clipboard-for-multiline-edits entry, generalizing the earlier Docker/get-docker.sh clipboard lesson into a real SSH jump-host workaround used while configuring Wazuh's syslog listener.
- **2026-07-19** - Big one: added five entries from the VLAN segmentation session (ATTACK/TARGET VLANs for Session 5) - the VLAN-aware bridge needing a real port, pfSense's own port going stale after the bridge changed under it, Kali's NetworkManager/`dhclient` mixup, pfSense Pass rules not logging by default, and the big one at the end: Wazuh's `logall`/`logall_json` being off by default, which was the true last-mile blocker after three other genuinely separate bugs were already found and fixed. Also added the anchor-id system (`<a id="...">` per entry) and the "How This Gets Used in the Blog" section at the top, so every entry can be deep-linked from a blog post as a plain blue hyperlink into a future `/errors` appendix page.
- **2026-07-20** - Added two entries from resuming Session 5: pfSense's `syslogd` daemon was silently dead since boot (found by bisecting states table, then rule config, then raw log file, then process list, fixed with `/etc/rc.d/syslogd start`), and a second, separate "off by default" archive gate on the Wazuh side - `logall`/`logall_json` (fixed 07-19) only writes the manager's local archive file, but Filebeat's own `archives.enabled` setting (in `/etc/filebeat/filebeat.yml`) independently gates whether that data actually gets indexed into OpenSearch for the dashboard to query. Both fixed; recon (`nmap -sV`) against Metasploitable confirmed visible end-to-end in both pfSense's firewall log and Wazuh's Discover view afterward.
- **2026-07-22** - Added two entries from the Windows Server 2022 VM build (Session 6): the OVMF/Secure Boot cert-mismatch theory that turned out to be a red herring (SeaBIOS switch was harmless but not the actual fix), and the real root cause - Microsoft's Evaluation Center page has two similarly-labeled "ISO" download links for the same product, and the wrong one (Languages and Optional Features, not the installer) got grabbed. This prompted creating the `configgoat` skill/standing practice: read every filename/detail already visible on screen in full before chasing a more technically interesting theory.
- **2026-07-24** - Added the CD-reboot restart-loop entry from resuming Session 6 on a fresh install (previous attempt died mid-install on 2026-07-23 when the daily-driver laptop's battery went out): pressing a key at "Press any key to boot from CD or DVD" is only correct on the very first boot, and doing it again on Setup's own automatic mid-install reboot relaunches the installer from scratch with no error shown. Diagnosed live via `configgoat` mode before the user confirmed it matched exactly.
- **2026-07-29** - Added two entries from Session 7 (Wazuh agent deployment, Build Log 06): the ATTACK VLAN's pfSense rule blocking inbound SSH to Kali despite outbound working fine (directional-rule lesson, diagnosed via `configgoat` mode by verifying SSH status and ping in both directions before concluding anything), and three separate single-character typos made retyping Wazuh's wizard-generated install commands by hand into VM consoles (comma/period/hyphen/sigil mixups), each producing a misleadingly plausible-sounding but wrong error message.
- **2026-08-10** - Added four entries from the Build Log 06 Kerberoasting session: bash's `!` history expansion mangling a correctly-typed password before Impacket ever saw it, an invisible trailing space breaking an `auditpol` subcategory match, the `targetUserName`-vs-`serviceName` field mixup while hunting the attack in Wazuh Discover, and - after methodically ruling out Windows auditing, rule-matching, and agent config filtering one layer at a time - a stale dashboard index-pattern field cache (compounded by possible agent-restart burst timing) that was making a genuinely-collected event look missing. All four have real fixes; none left open.
