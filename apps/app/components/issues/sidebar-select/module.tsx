import React from "react";

import { useRouter } from "next/router";

import useSWR, { mutate } from "swr";

// services
import modulesService from "services/modules.service";
// ui
import { Spinner, CustomSelect, Tooltip } from "components/ui";
// icons
import { RectangleGroupIcon } from "@heroicons/react/24/outline";
// types
import { IIssue, IModule, UserAuth } from "types";
// fetch-keys
import { ISSUE_DETAILS, MODULE_ISSUES, MODULE_LIST } from "constants/fetch-keys";

type Props = {
  issueDetail: IIssue | undefined;
  handleModuleChange: (module: IModule) => void;
  userAuth: UserAuth;
};

export const SidebarModuleSelect: React.FC<Props> = ({
  issueDetail,
  handleModuleChange,
  userAuth,
}) => {
  const router = useRouter();
  const { workspaceSlug, projectId, issueId } = router.query;

  const { data: modules } = useSWR(
    workspaceSlug && projectId ? MODULE_LIST(projectId as string) : null,
    workspaceSlug && projectId
      ? () => modulesService.getModules(workspaceSlug as string, projectId as string)
      : null
  );

  const removeIssueFromModule = (bridgeId: string, moduleId: string) => {
    if (!workspaceSlug || !projectId) return;

    modulesService
      .removeIssueFromModule(workspaceSlug as string, projectId as string, moduleId, bridgeId)
      .then((res) => {
        mutate(ISSUE_DETAILS(issueId as string));

        mutate(MODULE_ISSUES(moduleId));
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const issueModule = issueDetail?.issue_module;

  const isNotAllowed = userAuth.isGuest || userAuth.isViewer;

  return (
    <div className="flex flex-wrap items-center py-2">
      <div className="flex items-center gap-x-2 text-sm sm:basis-1/2">
        <RectangleGroupIcon className="h-4 w-4 flex-shrink-0" />
        <p>Module</p>
      </div>
      <div className="space-y-1 sm:basis-1/2">
        <CustomSelect
          label={
            <Tooltip
              position="top-right"
              tooltipHeading="Module"
              tooltipContent={modules?.find((m) => m.id === issueModule?.module)?.name ?? "None"}
            >
              <span
                className={`w-full max-w-[125px] truncate text-left sm:block ${
                  issueModule ? "" : "text-gray-900"
                }`}
              >
                {modules?.find((m) => m.id === issueModule?.module)?.name ?? "None"}
              </span>
            </Tooltip>
          }
          value={issueModule?.module_detail?.id}
          onChange={(value: any) => {
            value === null
              ? removeIssueFromModule(issueModule?.id ?? "", issueModule?.module ?? "")
              : handleModuleChange(modules?.find((m) => m.id === value) as IModule);
          }}
          disabled={isNotAllowed}
        >
          {modules ? (
            modules.length > 0 ? (
              <>
                {modules.map((option) => (
                  <CustomSelect.Option key={option.id} value={option.id}>
                    <Tooltip position="left-bottom" tooltipContent={option.name}>
                      <span className="w-full max-w-[125px] truncate">{option.name}</span>
                    </Tooltip>
                  </CustomSelect.Option>
                ))}
                <CustomSelect.Option value={null} className="capitalize">
                  <Tooltip position="left-bottom" tooltipContent="None">
                    <span className="w-full max-w-[125px] truncate"> None </span>
                  </Tooltip>
                </CustomSelect.Option>
              </>
            ) : (
              <div className="text-center">No modules found</div>
            )
          ) : (
            <Spinner />
          )}
        </CustomSelect>
      </div>
    </div>
  );
};