export default {
  scripts: {
      
  },
  
  handlers: {
    
  },

  pages: {
    
  },

  settings: {
    
  },

  groupedPages: {

  },  
};

export const actualPage = (config, path) => {  
  return config.pages ? config.pages[path] : config.groupedPages[path].pages[0];
}

