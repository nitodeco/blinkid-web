/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { renderWithOwner } from "@microblink/shared-components/renderWithOwner";
import { getOwner, JSX, ParentComponent, Show, splitProps } from "solid-js";

export const SolidShadowRoot: ParentComponent<
  {
    /** Disables shadow root, mostly useful for debugging */
    disableShadowRoot?: boolean;
    getRef?: (el: HTMLDivElement) => void;
  } & JSX.HTMLAttributes<HTMLDivElement>
> = (props) => {
  // we use getOwner in case of async rendering, for instance, it was used to
  // test rendering after a timeout
  const owner = getOwner();
  const [local, others] = splitProps(props, [
    "children",
    "disableShadowRoot",
    "getRef",
  ]);

  return (
    <div
      {...others}
      ref={(ref) => {
        if (local.disableShadowRoot) {
          return;
        }

        const shadowRoot = ref.attachShadow({ mode: "open" });

        renderWithOwner(() => <>{local.children}</>, shadowRoot, owner);
      }}
    >
      <Show when={local.disableShadowRoot}>{local.children}</Show>
    </div>
  );
};
