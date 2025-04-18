/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { EnvironmentProvider } from "@ark-ui/solid/environment";
import { Component, createSignal, JSX, onMount, Show } from "solid-js";

export const SmartEnvironmentProvider: Component<{
  children: (rootNode: Node) => JSX.Element;
}> = (props) => {
  const [rootNode, setRootNode] = createSignal<Node>();
  const [ref, setRef] = createSignal<HTMLSpanElement>();

  onMount(() => {
    const spanRef = ref();

    if (!spanRef) {
      return;
    }

    setRootNode(spanRef.getRootNode());
  });

  return (
    <>
      <Show when={rootNode()} fallback={<span ref={setRef} />}>
        {(rootNode) => (
          <EnvironmentProvider value={() => rootNode()}>
            {props.children(rootNode())}
          </EnvironmentProvider>
        )}
      </Show>
    </>
  );
};
