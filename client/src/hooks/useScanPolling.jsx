import { useState, useEffect } from "react";
import { toast } from "sonner";
import { API } from "../services/api";

/**
 * Polls a scan job until it completes or fails.
 * Returns isScanning state and extracted results.
 */
export function useScanPolling(scanJobId, searchParams, setSearchParams) {
  const [isScanning, setIsScanning] = useState(!!scanJobId);

  useEffect(() => {
    if (!scanJobId) return;

    const handleCompletion = (predicted, cores) => {
      const next = new URLSearchParams(searchParams);
      if (predicted.length > 0) {
        next.set("predicted", predicted.join(","));
        next.set("cores", cores.join(","));
      }
      next.delete("scanJobId");
      setSearchParams(next, { replace: true });
    };

    const handleFailure = (errorMessage) => {
      toast.error(errorMessage);
      const next = new URLSearchParams(searchParams);
      next.delete("scanJobId");
      setSearchParams(next, { replace: true });
      setIsScanning(false);
    };

    const checkStatus = async () => {
      try {
        const { data } = await API.get(`/auth/scan-status/${scanJobId}`);

        if (data.status === "completed") {
          clearInterval(interval);
          setIsScanning(false);
          const predicted = data.result?.predictedSkills ?? [];
          const cores = data.result?.coreLanguages ?? ["JavaScript"];
          handleCompletion(predicted, cores);
        } else if (data.status === "failed") {
          clearInterval(interval);
          handleFailure("Repository scan failed.");
        }
      } catch {
        clearInterval(interval);
        handleFailure("An error occurred while scanning.");
      }
    };

    checkStatus(); // run immediately
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [scanJobId]); // only re-runs if scanJobId changes

  return isScanning;
}
