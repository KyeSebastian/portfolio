# Build Log 05: Active Directory

## The Goal

The last of the four core pieces of this build: a real Windows Server domain controller, joined into the lab the same way it would be in any actual enterprise environment. Compared to everything else in this build, this one turned into the longest fight yet, not because Active Directory itself is hard to promote, but because getting a working Windows Server VM up in the first place took several real detours.

---

## Choosing the VM Shell

I decided on the spec early: `winserver`, 6GB RAM, 2 vCPU, 60GB disk, NIC on the internal network. I deliberately chose SATA for the disk and Intel E1000 for the network card instead of VirtIO for both. VirtIO is faster, but needs a separate driver ISO mounted mid-install or Windows won't see the disk or network at all. SATA and E1000 work with zero extra driver steps, which felt like the right trade for a VM that only needs to exist and work, not win a performance benchmark. I downloaded the Windows Server 2022 evaluation ISO from Microsoft's Evaluation Center directly onto the Windows laptop rather than through Proxmox's URL downloader, since Microsoft's evaluation links are signed and short-lived and don't reliably survive being fetched server-side.

---

## The Wrong ISO

I created the VM shell and hit trouble on the very first boot: `BdsDxe: ... Not Found` errors for both the blank disk (expected) and the CD-ROM (not expected, a real installer ISO should be found there). I diagnosed it as a Secure Boot certificate mismatch, since Proxmox's EFI Disk only pre-enrolls a newer certificate set than this ISO's build predates, and switched the VM over to legacy SeaBIOS to route around it.

[That diagnosis was a red herring](/errors#err-ovmf-secureboot-old-cert-red-herring). The SeaBIOS switch didn't actually fix anything, it just happened to run in parallel with the real fix. The actual problem: [I'd downloaded the wrong ISO entirely](/errors#err-microsoft-eval-center-two-iso-links). Microsoft's Evaluation Center page has two separate download links stacked close together for the same product. A plain "ISO" link near the top, which is actually the Languages and Optional Features package, meant to be mounted inside an already-installed server, not booted, and a "Download the ISO" link further down under "Get started for free," which is the real installer. Nothing visually distinguishes them. The only tell is the filename, `SERVER_LOF_PACKAGES_OEM` versus `SERVERSTANDARDEVAL`. I had the LOF file the whole time and didn't notice until well into troubleshooting a completely unrelated theory. I re-downloaded from the correct link and kept SeaBIOS anyway, since Windows Server doesn't actually require UEFI or TPM the way Windows 11 desktop does.

That session is what led directly to building the `configgoat` skill, a standing habit now, going forward, to read every filename and detail already visible on screen in full before chasing a more interesting-sounding theory.

---

## A Restart From Scratch

The next attempt at the install died mid-way when my daily-driver laptop's battery ran out while checking on the VM's progress over the SSH tunnel. The install itself runs entirely on the ThinkPad through Proxmox, independent of whatever laptop is watching it, but by the time I reconnected the state was unrecoverable enough to just start clean.

On the restart, I hit one more timing trap. Partway through, on Setup's own automatic mid-install reboot, the familiar "Press any key to boot from CD or DVD" prompt reappeared, and out of habit I pressed a key. [That relaunched the installer completely from scratch instead of letting the partially-installed OS continue booting from disk](/errors#err-winserver-cd-reboot-restart-loop). That prompt is only meant to be answered on the very first boot, when the disk is genuinely empty. Every reboot after that during the same install needs the prompt left alone entirely, and nothing on screen tells you that's the rule. I restarted clean one more time, doing nothing at every subsequent CD prompt, and Setup finished properly.

Right after setting the local Administrator password on first boot, the VM dropped to a lock screen that looked completely unresponsive to Ctrl+Alt+Del. [Browser-based consoles like Proxmox's noVNC can't actually pass a physical Ctrl+Alt+Del keystroke through to the VM at all](/errors#err-winserver-ctrlaltdel-console-intercept). The browser or host OS intercepts it first, on every remote console tool, not just this one. The console's own dedicated Ctrl+Alt+Del button unlocked it immediately.

---

## Promoting to a Domain Controller

With Windows actually installed, the rest went the way infrastructure is supposed to go. I set a static IP on the LAN adapter, installed the Active Directory Domain Services role through Server Manager, and promoted the machine to a domain controller: new forest, DSRM password set and saved, the DNS delegation warning ignored (expected, there's no parent zone for a lab forest to delegate from). The install ran, the VM rebooted on its own to apply it.

I confirmed it actually worked the only way that really proves it: logging back in using a domain-format login, `HOMELAB\Administrator`. That only succeeds if the domain genuinely stood up. A broken or incomplete promotion doesn't let you log in that way at all.

---

## Powering Down

All four core pieces of this build, pfSense, Wazuh, Kali-vs-target-with-detection, and now Active Directory, are done. Not "the VM exists," the same standard set from the very first entry: dashboard-verified, login-verified, actually proven working end to end. What's left isn't required to call the core lab done: Wazuh agents on `winserver` and Kali, to get host-level detection alongside the network-level detection already proved, plus whatever comes after that. But the core build, the thing this whole project was actually for, is done.
