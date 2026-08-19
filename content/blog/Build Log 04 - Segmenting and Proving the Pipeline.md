# Build Log 04: Segmenting and Proving the Pipeline

## The Realization, Not the Fix

I sat down ready to just run an attack, Kali against Metasploitable, and watch pfSense and Wazuh catch it. Then I actually looked at the network layout and realized the attack I was planning couldn't produce anything to detect. Kali and Metasploitable were both sitting on the exact same flat subnet. Traffic between two machines on the same subnet gets switched at Layer 2 and never touches a router or firewall at all. pfSense would never even see the exploit happen, let alone log it.

The choice was between running a hollow attack that night and fixing it later, or stopping to build real segmentation first. Real VLANs won, mostly because they scale the way a workaround doesn't. Any future VM just needs a tag number instead of a brand new virtual bridge per segment.

What followed was five separate, real bugs in a row, each one looking like the finish line and not being it.

---

## Bug One: A Bridge With No Real Port

I built two VLANs in pfSense, ATTACK (`192.168.10.0/24`) and TARGET (`192.168.20.0/24`), each with its own DHCP scope and pass rule, flipped `vmbr1` to VLAN-aware, and tagged Kali and Metasploitable onto their respective VLANs. Neither would boot. [Both failed immediately with "no physical interface on bridge"](/errors#err-vlan-aware-bridge-no-port). A VLAN-aware Linux bridge needs at least one real port to anchor its VLAN table before it'll accept a tagged virtual interface, and `vmbr1` had been built back in Build Log 02 with zero real ports on purpose, as a pure internal switch. Adding a harmless dummy interface as the bridge's port, applied live with no host reboot needed, fixed it.

## Bug Two: `dhclient` Doesn't Exist Anymore

Kali came up on its new VLAN, but `ip a` showed `eth0` holding only an IPv6 link-local address, no IPv4. Old reflex: force a renewal with `sudo dhclient eth0`. `command not found`. [Modern Kali manages networking through NetworkManager, not the older `isc-dhcp-client` tooling `dhclient` belongs to](/errors#err-kali-networkmanager-dhcp), and that package just isn't installed by default anymore. `nmcli device status` showed what was actually going on, the interface sitting `disconnected`, and `nmcli device connect eth0` was the real fix, though the lease still didn't fully stick until the stale trunk port below got sorted too.

## Bug Three: A Port That Never Got the Memo

Both VMs booted and pulled DHCP leases on their correct VLANs, but neither could reach pfSense at all. The real problem was on pfSense's side. [It had been running since before `vmbr1` went VLAN-aware](/errors#err-pfsense-stale-trunk-port), and its own bridge port never got reassigned a trunk role once the bridge's rules changed underneath it. Rebooting the pfSense VM forced its interface to reattach fresh and pick up the correct trunk-port role. DHCP started working on both VLANs right after.

## Bug Four: Working and Invisible Are Different Things

With both VLANs actually routing, I pinged across them to confirm it in pfSense's firewall log. The ping worked. The log showed nothing. [Pass rules don't log their own matches by default](/errors#err-pfsense-rule-logging-default-off). It's a separate per-rule checkbox, entirely independent of whether the rule is actually passing traffic. Flipping that on for both rules made the crossing show up immediately, correctly tagged by VLAN.

## Bug Five: The Last-Mile Gap

One layer left to check: did any of this actually reach Wazuh. I pinged again and tailed the archive log on the Wazuh VM. Nothing, even though pfSense routing, pfSense logging, and syslog forwarding had all already been independently confirmed working that same night. [Wazuh's own `logall` and `logall_json` settings were both off by default](/errors#err-wazuh-logall-disabled). Without them, Wazuh only writes to its archive when something trips an actual alert rule, and raw forwarded firewall traffic doesn't trigger one on its own. Flipping both on and restarting the manager got the pfSense entries landing in the archive within seconds.

By the end of that night, the full pipeline was confirmed end to end: pfSense routing and logging traffic correctly across two VLANs, syslog carrying it to Wazuh, Wazuh actually archiving it. It was already working before any attack ever happened.

---

## Why No Physical Switch

> You'll notice there's no physical switch in this setup, even though I own one. Part of that is timing, it didn't arrive until about a week after I'd already started the build. Part of it is where it would have to live: the router sits in my son's room, and he's eleven months old and more interested in getting his hands on real objects than any toy I put in front of him, so that room stays deliberately baby-proofed. Running more hardware and cable in there wasn't worth it for a lab that could be segmented in software instead. And it wouldn't have mattered anyway. Every VM in this lab lives on one hypervisor, so there was never a physical wire between Kali and Metasploitable to segment in the first place. pfSense and Proxmox's VLAN-aware bridge do the same job a switch would, just one layer down in software, the same idea AWS and Azure run entire clouds on.

---

## Proving It Actually Works

The next session I picked this back up expecting to go straight to the exploit. Instead I hit two more gaps in a pipeline I'd thought was already finished.

pfSense's firewall log had gone completely silent, nothing newer than an hour old even with fresh traffic hitting it. Routing itself was fine, and the pass rule was correctly configured with logging on, so neither was the problem. [The actual cause was that `syslogd`, the daemon that writes matched packets to the log file, wasn't running at all](/errors#err-pfsense-syslogd-dead-after-boot), even though the process reading packets off the firewall's interface was alive. Starting it by hand got logs flowing again within seconds, most likely a startup-order race on pfSense's fairly thin RAM allocation now juggling VLANs and remote syslog on top of everything else.

Separately, trying to view the archived logs in Wazuh's own dashboard instead of over SSH turned up nothing, as if the fix from the night before had done nothing at all. [Turned out `logall`/`logall_json` only controls whether the Wazuh manager writes archives to its own local file](/errors#err-wazuh-filebeat-archives-disabled). Actually getting that data indexed so the dashboard can query it is a second, completely separate switch: Filebeat's own `archives.enabled` setting, off by default independently of the manager-side one. Flipping it on got the index showing up immediately, already holding hundreds of documents that had been piling up server-side the whole time.

With the pipeline actually verified, I ran a scan from Kali against Metasploitable and confirmed the classic port list, including vsftpd 2.3.4 on port 21. I picked its known backdoor deliberately, not because it's creative, it's the single most-used exploit in every Metasploitable walkthrough that exists, but because this session wasn't about proving I could attack creatively. It was a controlled test signal: the simplest possible way to generate real, known traffic and confirm the pipeline reacts to it correctly. Saving actual attacker creativity, a real target and a technique that isn't a one-line canned backdoor, for later felt like the right split.

`msfconsole`, the exploit, `RHOSTS` and `LHOST` set. `Meterpreter session opened`, `getuid` came back root. Exactly the known-good result I needed. pfSense's firewall log caught the whole multi-stage chain within the same second as the session opening, every port, both directions, VLAN tags intact. Wazuh's side was the one gap that session, the search came back empty and the SSH tunnel dropped mid-troubleshooting before I could dig further, so I closed it out on pfSense's confirmation alone, since the archive pipeline had already been proven working independently that same night.

Network-level detection was confirmed. What was still unproven was anything host-level: process execution, file changes, privilege escalation once a shell's already open. That gap, and a real attack worth the name instead of a canned backdoor, is what the rest of this build was still building toward.
