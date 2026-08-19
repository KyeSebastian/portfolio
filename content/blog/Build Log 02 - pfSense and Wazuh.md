# Build Log 02: pfSense and Wazuh

## The Goal

With Proxmox actually running, it was time to build the two things everything else in this lab depends on: a firewall/router (pfSense) and a SIEM to watch what that firewall sees (Wazuh). Before pfSense could even go in, there needed to be somewhere for it to route traffic between. I created `vmbr1` in Proxmox, a second network bridge with no physical ethernet port attached to it at all, just a purely internal, virtual switch that only VMs plug into. pfSense gets two network cards: one on `vmbr0` (the WAN side, bridged to my actual home network) and one on `vmbr1` (the LAN side, the internal lab network). Every VM after this one attaches to `vmbr1`, never `vmbr0`. 

---

## Getting pfSense Installed

Downloading pfSense turned into its own small maze. The installer isn't just sitting on a plain download page anymore. It's a $0 checkout through Netgate's shop, and [the file that comes down is secretly gzip-compressed even though Windows shows it with a plain `.iso` name](/errors#err-pfsense-iso-gzip). I needed 7-Zip to actually extract the real installer before Proxmox would touch it.

The install itself went smoother than the download: ZFS filesystem, GPT partition scheme, latest stable release, wipe the (empty) disk, done. First boot brought me into pfSense's console menu and auto-assigned both interfaces. WAN grabbed an address from my home router like expected, but LAN was still sitting on pfSense's default, which happened to be [the exact same /24 as WAN](/errors#err-wan-lan-subnet-collision). Two interfaces on the same router both claiming the same subnet is a real, basic routing violation, nothing was going to work right until that got fixed.

Fixing it should have been a two-minute job, but because the console wizard has two questions that sound nearly identical but mean opposite things: "should this interface **ask for** an IP address" (DHCP client) versus "should this interface **hand out** IP addresses" (DHCP server). I answered the client question wrong and [left LAN configured to request an address instead of holding a static one](/errors#err-lan-dhcp-client-mixup). Then I hit [the same client-vs-server confusion again for IPv6](/errors#err-dhcp6-vs-dhcp-server-confusion) a few prompts later in that same wizard. Once I actually slowed down and answered each prompt for what it was asking rather than what I assumed it was asking, LAN landed cleanly on `192.168.2.1/24`, with its own DHCP range for future VMs.

---

## Making the Lab Actually Reachable

Here's something nobody mentions in the getting-started guides: once pfSense and Wazuh both have their own internal IPs on `vmbr1`, your regular laptop still can't see them. `vmbr1` has no physical port and no bridge to your home network. It's an island on purpose. I hit this directly trying to open pfSense's web GUI at `https://192.168.2.1` from my daily-driver laptop and getting nothing.

The real fix was an SSH SOCKS proxy: give the Proxmox host itself an address on `vmbr1`, then run `ssh -D 1080 root@<thinkpad-ip>` from the Windows laptop, which opens a local SOCKS proxy tunneled straight through the host and into the internal lab network. I pointed Firefox's proxy settings at `127.0.0.1:1080` and suddenly `192.168.2.1` and `192.168.2.100` are both reachable, like the laptop had grown a second network card. [Assigning that address to the Proxmox host through the web UI reported success with no errors](/errors#err-vmbr1-ip-silent-noop). It then completely failed to actually take effect, because the UI silently never wrote the change to the underlying config file. So I had to go edit `/etc/network/interfaces` and reload it live to get the address to actually stick. First of a few times this build taught me not to trust a clean "success" message as proof anything actually happened.

The first time pfSense's web GUI loaded through that tunnel, it auto-launched its Setup Wizard. [The WAN page defaults to blocking all private/RFC1918 address ranges](/errors#err-pfsense-wan-rfc1918-block), which sounds like a sensible security default until you realize pfSense's own WAN address, sitting behind my home router, is itself a private address. Leaving that box checked would have had pfSense blocking its own upstream connection. I unchecked it, kept the wizard moving, and both dashboards were finally loading in a real browser.

---

## Standing Up Wazuh

Wazuh doesn't ship as its own installable image. It's an Ubuntu Server VM with Wazuh's own install script run on top. Ubuntu went in clean, no surprises. The install script did not.

Following the docs' generic `/4.x/` download path, `curl` reported success and saved a file with the right name. Except [that file was actually an XML error page, not a shell script](/errors#err-wazuh-stale-install-url), because Wazuh's package host had moved to version-pinned URLs and the generic path just quietly served an error response instead of a real 404. The only reason I caught it was that running the "script" threw a syntax error instead of doing anything. A `head` on the file would have shown the problem in about two seconds if I'd thought to check first. I corrected the URL to the version-pinned one, verified the download actually looked like a shell script before running it, and the install completed cleanly on the second try. Manager and dashboard both were up.
