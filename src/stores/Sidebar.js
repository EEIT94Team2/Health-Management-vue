import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    selectedMenuItemText: '',
  }),
  actions: {
    setSelectedItemText(text) {
      this.selectedMenuItemText = text;
    },
  },
});