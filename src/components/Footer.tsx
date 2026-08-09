"use client";

import { useEffect, useState } from 'react';
import { useRPC2Call } from '@/contexts/RPC2Context';
import themeMetadata from '../../komari-theme.json';

const Footer = () => {
  const formatBuildTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Shanghai'
    }) + ' (GMT+8)';
  };

  const buildTime = null;
  const [versionInfo, setVersionInfo] = useState<{ hash: string; version: string } | null>(null);
  const { call } = useRPC2Call();

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const data = await call("common:getVersion")
        setVersionInfo({ hash: data.hash?.slice(0, 7), version: data.version });
      } catch (error) {
        console.error('Failed to fetch version info:', error);
      }
    };

    fetchVersionInfo();
  }, [call]);

  return (
    <footer className="border-t bg-gradient-to-b from-card/30 to-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground text-center">
            {buildTime && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Build:</span>
                <span>{formatBuildTime(buildTime)}</span>
              </div>
            )}
            {versionInfo && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Version:</span>
                  <span className="font-mono">{versionInfo.version}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Theme:</span>
                  <span className="font-mono">{themeMetadata.version}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Commit:</span>
                  <code className="px-1.5 py-0.5 bg-muted rounded font-mono text-[10px]">
                    {versionInfo.hash}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
