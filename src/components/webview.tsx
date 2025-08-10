"use client";

import { requestDevServer as requestDevServerInner } from "./webview-actions";
import "./loader.css";
import {
  FreestyleDevServer,
  FreestyleDevServerHandle,
} from "freestyle-sandboxes/react/dev-server";
import { useRef, useEffect } from "react";
export default function WebView(props: {
  repo: string;
  baseId: string;
  appId: string;
  domain?: string;
  onRefreshReady?: (refreshFn: () => void) => void;
}) {
  function requestDevServer({ repoId }: { repoId: string }) {
    return requestDevServerInner({ repoId });
  }

  const devServerRef = useRef<FreestyleDevServerHandle>(null);

  useEffect(() => {
    if (props.onRefreshReady) {
      props.onRefreshReady(() => devServerRef.current?.refresh());
    }
  }, [props.onRefreshReady]);

  return (
    <div className="flex flex-col overflow-hidden h-full border-l transition-opacity duration-700 mt-[2px]">
      <FreestyleDevServer
        ref={devServerRef}
        actions={{ requestDevServer }}
        repoId={props.repo}
        loadingComponent={({ iframeLoading, devCommandRunning }) =>
          !devCommandRunning && (
            <div className="flex items-center justify-center h-full">
              <div>
                <div className="text-center">
                  {iframeLoading ? "JavaScript Loading" : "Starting VM"}
                </div>
                <div>
                  <div className="loader"></div>
                </div>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}
