# Build Log 03: Building the Attack Surface

## The Goal

With the network and the SIEM in place, next came the machines that would actually give me something to attack and something to watch. Two tracks here: vulnerable web apps running as Docker containers for practice on their own, and the real attacker/target pair, Kali and Metasploitable 2, that the rest of this build's detection story depends on.

---

## Containers First

I built a new VM, `ubuntucontainers`, on the same internal network as everything else, and installed Docker by hand on top of a clean Ubuntu Server base. Before I'd even gotten that far, typing `ubuntu-containers` into Proxmox's VM name field threw "not a valid hostname," which a plain hyphen shouldn't do. Later that same session, an unrelated command failed the exact same way: `ls -la get-docker.sh` found the file sitting right there, correct size and everything, but `wc -l` on the identical filename said it didn't exist. [Both errors turned out to share one root cause](/errors#err-fancy-dash-hostname-filename): a pasted hyphen that wasn't actually a hyphen. Something upstream had swapped in a typographic look-alike character, visually identical but a different byte, and both Proxmox's validation and the shell treated it as something else entirely. Renaming without a hyphen at all and retyping the filename by hand instead of pasting fixed both at once.

With Docker actually running, DVWA and Juice Shop went in clean as two separate containers, each reachable in the browser through the same SSH tunnel from Build Log 02. Two genuinely vulnerable, purpose-built targets, live and separate from the Kali/Metasploitable attack path, just sitting there for OWASP-style web practice whenever I want it.

---

## Kali, the Easy One

After fights with pfSense's subnet mixup, Wazuh's stale install URL, and a fake hyphen character, Kali turned out to be the easiest VM in the whole build. Standard Kali/Debian installer, guided partitioning, default desktop and tool metapackage. It booted straight to the desktop and pulled a DHCP address with zero fighting. After everything else that week, it was almost suspicious how uneventful this one was.

---

## Metasploitable 2, an Import Instead of an Install

Metasploitable 2 doesn't ship as an ISO at all. It's a pre-built `.vmdk` disk image from rapid7, distributed through SourceForge. I downloaded it, copied the disk over to the Proxmox host with `scp`, and built the VM backwards from how every other machine in this lab got built: empty shell first, then `qm importdisk` to bring the `.vmdk` in and attach it. I attached it as **IDE**, not SCSI or VirtIO, since this image predates VirtIO drivers entirely and the guest would never see a disk attached that way.

First boot after that gave me a fast, looping "no bootable device" message instead of the login prompt. [The Boot Order dialog had the actual disk unchecked, while the empty CD-ROM slot and network boot were both checked instead](/errors#err-metasploitable-boot-order). Importing and attaching a disk doesn't automatically mark it bootable. Checking `ide0` explicitly and dragging it above the empty entries got it booting straight to the classic `msfadmin`/`msfadmin` login on the next try.

---

## Powering Down

Both machines exist now, attacker and target, sitting on the same LAN. Neither one has anything watching it yet, and they can talk to each other freely with pfSense having no reason to notice. That gap, and closing it, is exactly what the next entry exists for.
