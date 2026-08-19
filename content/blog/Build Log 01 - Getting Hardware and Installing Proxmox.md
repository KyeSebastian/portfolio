# Build Log 01: Getting Hardware and Installing Proxmox

## The Goal

Before any of the technical work could start, I had to figure out what machine would actually run this lab, then turn it into a bare-metal Proxmox host. This entry covers both: the hardware search and the install itself, the part where the project stops being a plan on paper and starts being an actual machine sitting in my son's room with a completely different job than it had yesterday.

---

## Finding the Right Machine

Going in, I assumed I just needed any decent machine already sitting around the house. I had a MacBook, a gaming PC, and a Windows laptop. The gaming PC was out immediately: it connects over Wi-Fi, not ethernet, since I didn't want to run a long cable through the house, and real network segmentation with pfSense needs a direct wired connection.

Don't get me started on the MacBook. I should have never even considered it, but it seemed cost-effective at the time. I actually looked into what running Proxmox on it would take: Apple's T2 chip turns Secure Boot into its own separate project, there's no built-in ethernet port on a MacBook Air 2018, and I'd need a USB-C adapter just to get wired. I was convinced I'd push through it anyway, got the adapter, then learned I also needed a USB flash drive to boot the Proxmox installer. Guess what else the Mac didn't have a port for. The MacBook became obsolete.

Let me tell you guys about Facebook Marketplace. I first tried scavenging a laptop from a swap meet, and honestly, don't waste your time there. Marketplace specs for the same budget are so much more reasonable. I ended up with a ThinkPad specifically for the lab, around $150: 24GB RAM, 500GB storage, i7, and a built-in ethernet port. Compared to what I'd browsed at the swap meet, this thing topples those by miles.

What I didn't fully appreciate until later: once Proxmox is installed, I never have to physically sit at the ThinkPad again. It has a full web UI reachable from any browser on the same network. So the ThinkPad lives in my son's room on the ethernet connection, and I manage everything from my laptop in another room. That completely changed how I thought about the setup.

**What I'd tell someone starting out:** don't overthink the hardware. At least 16GB RAM (8GB will bottleneck you fast once you're running more than one or two VMs), a wired ethernet port, and Intel VT-x enabled in BIOS. Storage matters more if you're planning to self-host services on top, since my 500GB won't stand a chance for that later, but for a first home lab, a used ThinkPad or Dell off Facebook Marketplace in the $50 to $200 range is enough to get you started.

---

## Flashing the Installer and the BIOS

I downloaded the Proxmox VE ISO straight from proxmox.com and grabbed Rufus (portable, no install needed) to flash it onto a USB drive. One thing that actually matters: use **DD Image mode**, not ISO mode, when Rufus asks. Get that wrong and the drive can silently fail to boot with no warning.

Getting into the ThinkPad's BIOS took a couple of tries, I was apparently too slow tapping F1 twice, but got in on the third attempt. Once I was in, the checklist was Intel VT-x and VT-d enabled, Secure Boot disabled, and boot order set so the USB actually gets picked first. That last one genuinely mattered: Windows Boot Manager was sitting *above* my freshly-flashed USB in the boot priority list. If I hadn't caught that and dragged the USB to the top myself, the laptop would've just silently booted straight into Windows with zero error message.

---

## The Install Itself

FORGET about your mouse! My trackpad stopped registering clicks, I plugged in a real USB mouse next, and still nothing. Turns out the installer's GUI runs entirely on keyboard: Tab, Shift+Tab, Enter. Nobody warns you ahead of time, so now I'm warning you.

On the disk-selection screen I opened **Advanced Options** to confirm the full 500GB was actually being allocated instead of trusting whatever swap/buffer split the installer wanted by default. Set a hostname, a static-leaning IP for the web UI, a root password, let it auto-reboot. The console came up clean at a local login prompt right after. That's basically the last time I ever needed to sit at this machine directly.

---

## Getting the Host Into Shape

Logging into `https://[thinkpad-ip]:8006` for the first time from my regular Windows laptop threw the expected self-signed cert warning and the standard "no valid subscription" nag, not an error, just Proxmox reminding you there's a paid tier I'm not using.

Before touching the actual lab, I found a set of community maintenance scripts (`community-scripts/ProxmoxVE` on GitHub) that get a fresh host into a real, production-ish baseline instead of leaving it on installer defaults. I was skeptical they'd actually save time. They did. In one pass: switched the package repo off the paid enterprise source and killed the subscription nag, installed the correct CPU microcode, scheduled weekly SSD trims, and ran a baseline SMART disk health check, worth having on record since this is a used drive. I also set the CPU scaling governor to `performance`. [First attempt actually landed on `powersave` instead](/errors#err-scaling-governor-powersave), because I picked the wrong option in the script's own menu without reading it closely enough. Caught it on the next pass and fixed it.

Before deploying the first real VM, I stopped and compared this build against actual SOC/network-engineer baselines instead of just what the YouTube walkthroughs happened to cover. That surfaced a real gap I'd completely missed: I hadn't created an internal network bridge for the lab's VMs to live on yet, which meant the firewall I was about to deploy next would have nothing to route or protect. Fixed that before moving forward.

That same pass also meant saying no to things on purpose. I looked hard at Proxmox Backup Server, Ansible/Terraform, Prometheus monitoring, and Proxmox Datacenter Manager, all of which show up on every "best of" home lab list, and skipped every one of them. PBS needs a second machine to back up to, which I don't have. Ansible/Terraform and Datacenter Manager solve managing a fleet of VMs across multiple hosts, and this is a handful of VMs on one box, built by hand. Prometheus is redundant here too, since Wazuh is already going to be my monitoring and alerting story for this whole lab. Knowing which tools not to reach for mattered just as much as picking the ones I did.
