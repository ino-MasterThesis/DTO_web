.PHONY: rsync-viewer
rsync-viewer:
	sudo rsync --checksum -av --dry-run -e "ssh -i /home/ddz92478/.ssh/id_elab -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no" ./dist/* ino@sdm.hongo.wide.ad.jp:/home/ino/DigitalTwinOntology2/viewer/
