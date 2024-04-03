import sampleSelectedItems from "../stories/IpaPageComponents/sample_selectedItems.json";

const noop = () => {}
Object.defineProperty(window, "scrollTo", { value: noop, writable: true });

sessionStorage.setItem("project",JSON.stringify(sampleSelectedItems.selectedProject));
/*
const localStorageMock = (() => {
    let store = {};

    return {
        getItem(key) {
            return store[key] || null;
        },
        setItem(key, value) {
            store[key] = value.toString();
        },
        removeItem(key) {
            delete store[key];
        },
        clear() {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
});
 */