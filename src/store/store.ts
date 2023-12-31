import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';

class FileSystemStore {
	rootFolder = {
		id: uuidv4(),
		name: 'Root',
		isFolder: true,
		parentId: null,
		children: [] as (Folder | File)[],
	};

	constructor() {
		makeAutoObservable(this);
	}

	addFolder(parentId: string | null, name: string) {
		const newFolder: Folder = {
			id: uuidv4(),
			name,
			isFolder: true,
			children: [],
			parentId: null,
		};

		if (parentId) {
			newFolder.parentId = parentId;
			const parent = this.findItemById(parentId);
			if (parent && 'children' in parent) {
				parent.children.push(newFolder);
			}
		} else {
			this.rootFolder.children.push(newFolder);
		}
	}

	addFile(parentId: string | null, name: string) {
		const newFile: File = {
			id: uuidv4(),
			name,
			isFolder: false,
			parentId,
		};
		if (parentId) {
			const parent = this.findItemById(parentId);
			if (parent && 'children' in parent) {
				parent.children.push(newFile);
			}
		} else {
			this.rootFolder.children.push(newFile);
		}
	}

	findItemById(id: string | null): Folder | File | null {
		const searchQueue: (Folder | File)[] = [this.rootFolder];
		let currentIndex = 0;

		while (currentIndex < searchQueue.length) {
			const currentItem = searchQueue[currentIndex];

			if (currentItem && currentItem.id === id) {
				return currentItem;
			}

			if (currentItem && 'children' in currentItem) {
				const children = currentItem.children;
				for (const child of children) {
					searchQueue.push(child);
				}
			}
			currentIndex++;
		}

		return null;
	}

	deleteFileById(fileId: string) {
		this.deleteItemById(fileId);
	}

	deleteFolderById(folderId: string) {
		this.deleteItemById(folderId);
	}

		deleteItemById(itemId: string) {
		const itemToDelete = this.findItemById(itemId);
		if (!itemToDelete) {
			console.error(`Item with id ${itemId} not found.`);
			return;
		}

		if (itemToDelete.parentId !== null) {
			const parentItem = this.findItemById(itemToDelete.parentId);

			if (parentItem && 'children' in parentItem) {
				const children = parentItem.children;
				const indexToDelete = children.findIndex(child => child.id === itemId);

				if (indexToDelete !== -1) {
					children.splice(indexToDelete, 1);
				}
			} else {
				console.error(
					`Parent item with id ${itemToDelete.parentId} not found.`
				);
			}
		} else {
			const rootIndexToDelete = this.rootFolder.children.findIndex(
				child => child.id === itemId
			);

			if (rootIndexToDelete !== -1) {
				this.rootFolder.children.splice(rootIndexToDelete, 1);
			}
		}
	}
}






interface BaseItem {
	id: string;
	name: string;
	isFolder: boolean;
	parentId: string | null;
}

interface Folder extends BaseItem {
	isFolder: true;
	children: (Folder | File)[];
}

interface File extends BaseItem {
	isFolder: false;
}
export const fileSystemStore = new FileSystemStore();
