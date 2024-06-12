# IafKgraphUI

Use iaf-kgraph-ui to render a knowledge graph with the Canvas component and utilize its store and various context controllers and hooks.

## Install

```js
npm install @dtplatform/iaf-kgraph-ui
```

## Import 

```js
import {
  Canvas,
  ConfigContext,
  ConfigController,
  RightMenuController,
  GraphBoundsController,
  store,
  NodeMenuController,
  LoadMoreDialogController,
} from "@dtplatform/iaf-kgraph-ui";
```

## Usage

Create your own KnowledgeGraph component by using the available library components and your own customizations.

For the most basic knowledge graph canvas, import and use the components described in [Basic knowledge graph canvas](#basic-knowledge-graph-canvas).

To add an on-node-click menu above each node that the user can use to edit, delete, or hightlight the clicked node, or add a new node in relation to the current, see [NodeMenu and NodeMenuController](#nodemenu-and-nodemenucontroller).

To add a right-click menu for nodes, see [RightMenuController](#rightmenucontroller).

To add functionality to load an additional 25 nodes at each button click, see [LoadMoreDialogController](#loadmoredialogcontroller).

> **Important:** To ensure that your KnowledgeGraph component has access to the necessary context data and functions, when you import and use the component in a parent component, wrap it in the context controllers described in [Higher-level wrappers](#higher-level-wrappers). 

### Basic knowledge graph canvas

For the most basic setup of just the knowledge graph canvas, nest the following components as described below:

```jsx
<ConfigController graphConfig={graphConfig as any}>
  <Provider store={store}>
    <GraphBoundsController>
      <GraphContainer>
        <Canvas />
      </GraphContainer>
    </GraphBoundsController>
  </Provider>
</ConfigController>
```

#### Canvas

Places graph nodes on a canvas. The Canvas component and any custom components require a graph container you define.

#### GraphContainer

Create your own GraphContainer component to define the viewport for the knowledge graph canvas.

The following example invokes the `width` and `height` values from `ConfigContext` as well as some style properties.

```jsx
function GraphContainer({ children }: { children: React.ReactNode }) {
  useConfigSync();

  const { config } = useContext(ConfigContext as any)! as any;

  return (
    <div
      id={"knowledge-graph-container"}
      style={{
        position: "relative",
        width: config.width,
        height: config.height,
        overflow: "hidden",
        ...config.style,
      }}
      className={config.className}
    >
      {children}
    </div>
  );
}
```

You can then wrap the `Canvas` component with your `GraphContainer` component.

```jsx
  <ConfigController graphConfig={graphConfig as any}>
    <Provider store={store}>
      <GraphBoundsController>
        <GraphContainer>
          <Canvas />
        </GraphContainer>
      </GraphBoundsController>
    </Provider>
  </ConfigController>
```

#### GraphBoundsController

Controls the graph boundaries

#### Store provider

Stores the reducers and middleware

#### ConfigController

Maintains context of your config

### NodeMenu and NodeMenuController

To add a menu for each node that the user can use to edit, delete, or hightlight the clicked node, or add a new node in relation to the current, use the NodeMenu component and wrap it with the `NodeMenuController` context component:

```jsx
  <ConfigController graphConfig={graphConfig as any}>
    <Provider store={store}>
      {/* Controls the node menu */}
      <NodeMenuController> 
        <GraphBoundsController>
          <GraphContainer>
            <Canvas />
            {/* Added NodeMenu component */}
            <NodeMenu />
          </GraphContainer>
        </GraphBoundsController>
      </NodeMenuController>
    </Provider>
  </ConfigController>
```

### RightMenuController

To add a right-click menu for nodes, import and use the `RightMenuController` wrapper component:

```jsx
  <ConfigController graphConfig={graphConfig as any}>
    <Provider store={store}>
      {/* Added RightMenuController wrapper */}
      <RightMenuController>
        <NodeMenuController>
          <GraphBoundsController>
            <GraphContainer>
              <Canvas />
              <NodeMenu />
            </GraphContainer>
          </GraphBoundsController>
        </NodeMenuController>
      </RightMenuController>
    </Provider>
  </ConfigController>
```

### LoadMoreDialogController

By default, 25 nodes load. To add functionality to load an additional 25 nodes at each button click, use the `LoadMoreDialogController` wrapper.

```jsx
  <ConfigController graphConfig={graphConfig as any}>
    <Provider store={store}>
      {/* Added controller */}
      <LoadMoreDialogController>
        <GraphBoundsController>
          <GraphContainer>
            <Canvas />
          </GraphContainer>
        </GraphBoundsController>
      <LoadMoreDialogController>
    </Provider>
  </ConfigController>
```

### Example

```jsx

import React, { Dispatch, SetStateAction, memo, useContext } from "react";
import { Provider } from "react-redux";
import {
  Canvas,
  ConfigContext,
  ConfigController,
  RightMenuController,
  GraphBoundsController,
  store,
  NodeMenuController,
  LoadMoreDialogController,
} from "@dtplatform/iaf-kgraph-ui";
import "@dtplatform/iaf-kgraph-ui/dist/style.css";
import NodeMenu from "../components/NodeMenu";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import useConfigSync from "../_hooks_/useConfigSync";

function GraphContainer({ children }: { children: React.ReactNode }) {
  useConfigSync();

  const { config } = useContext(ConfigContext as any)! as any;

  return (
    <div
      id={"knowledge-graph-container"}
      style={{
        position: "relative",
        width: config.width,
        height: config.height,
        overflow: "hidden",
        ...config.style,
      }}
      className={config.className}
    >
      {children}
    </div>
  );
}

function Graph(
  graphConfig: Partial<any> & {
    drawerProps?: any;
    setDrawerProps: Dispatch<SetStateAction<any>>;
  }
) {
  const { openModal } = useModal();

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >   
      <div style={{ position: "relative" }}>
        <ConfigController graphConfig={graphConfig as any}>
          <Provider store={store}>
            <LoadMoreDialogController>
              <RightMenuController>
                <NodeMenuController>
                  <GraphBoundsController>
                    <GraphContainer>
                      <ModalDialogs />
                      <SearchBar />
                      <FilterBar />
                      <Canvas />
                      <NodeMenu />
                    </GraphContainer>
                  </GraphBoundsController>
                </NodeMenuController>
              </RightMenuController>
            </LoadMoreDialogController>
          </Provider>
        </ConfigController>
      </div>
    </div>
  );
}

export default memo(Graph); 

```

## Higher-level wrappers

In the parent component that imports and uses your knowledge graph component, wrap the knowledge graph component in the `DataStateProvider` and `ActiveGraphController` wrappers.

```jsx
  return (
    <div onContextMenu={preventDefaultContextMenu}>
      <DataStateProvider>
        <ActiveGraphController>
          <Grid container spacing={1}>
            <ItemTree title="Items" />
            <Grid item xs={6}>
              <KnowledgeGraph
                explore={getConnection}
                onClickAddon={handleClickAddon}
              />
            </Grid>
          </Grid>
        </ActiveGraphController>
      </DataStateProvider>
    </div>
  );
```

### ActiveGraphController

Controls which graph is the currently active graph

### DataStateProvider

Maintains data state