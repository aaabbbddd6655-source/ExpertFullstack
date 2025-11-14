// File upload component using Uppy v5 with Dashboard plugin
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import AwsS3 from "@uppy/aws-s3";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (uploadedUrl: string) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        if (result.successful && result.successful.length > 0) {
          const uploadUrl = result.successful[0].uploadURL;
          if (uploadUrl) {
            onComplete?.(uploadUrl);
          }
        }
      })
  );

  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dashboardRef.current) {
      uppy.use(Dashboard, {
        target: dashboardRef.current,
        inline: false,
        trigger: null,
        proudlyDisplayPoweredByUppy: false,
      });
    }

    return () => {
      uppy.close();
    };
  }, [uppy]);

  const handleOpen = () => {
    const dashboard = uppy.getPlugin('Dashboard') as Dashboard | undefined;
    if (dashboard) {
      dashboard.openModal();
    }
  };

  return (
    <div>
      <Button onClick={handleOpen} className={buttonClassName} data-testid="button-upload-file">
        {children}
      </Button>
      <div ref={dashboardRef} />
    </div>
  );
}
