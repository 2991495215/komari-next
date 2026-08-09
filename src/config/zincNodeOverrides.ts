export type ZincIpCapabilities = {
  ipv4?: boolean;
  ipv6?: boolean;
};

// Komari 1.3.x public node payload does not expose ipv4/ipv6 flags.
// Keep ZINC's display metadata in source until the backend exposes them.
export const ZINC_NODE_IP_CAPABILITIES: Record<string, ZincIpCapabilities> = {
  "00460c29-3f4e-42e4-8dad-aed12917a855": { ipv4: true },
  "064f9953-f991-4765-90a4-1881b20b7a8e": { ipv4: true },
  "067c08b0-4546-47c0-ba45-e5bdcf507d90": { ipv4: true },
  "174d6411-7d25-47b2-9cac-1881daf8ba48": { ipv4: true, ipv6: true },
  "1ad9ee89-cdb0-495b-8e5a-c4fdc8916867": { ipv4: true },
  "34b80f52-bce5-40d3-a368-ccc97bb1d1bb": { ipv4: true },
  "3f5a4bc2-8968-48e9-ac8b-8297043f23e2": { ipv4: true, ipv6: true },
  "41c20bbd-8c10-43c5-9f88-8e658e06bdc2": { ipv6: true },
  "4eccfc1c-5037-48d1-a088-161aa5f4f00c": { ipv4: true, ipv6: true },
  "50e7164c-e83a-4df6-b40d-ab1161ad043b": { ipv4: true, ipv6: true },
  "5669e1d7-28a2-49f7-85a5-571cbab5afca": { ipv4: true },
  "6f11df07-3cf8-4376-a36f-3d25337ce409": { ipv4: true, ipv6: true },
  "6f81ac2a-194b-4ecb-96bc-b0f7135f622b": { ipv4: true, ipv6: true },
  "8388b42a-2dcb-4ae2-8b08-5c0c706cd6f7": { ipv4: true, ipv6: true },
  "89a36203-13e9-4bc4-805c-ac41cc296ad5": { ipv4: true, ipv6: true },
  "8ea0e66a-dcf2-43fd-ae2f-074b9d2664d6": { ipv4: true, ipv6: true },
  "99ffb0f2-4228-4635-b9a5-b8de423f63ab": { ipv4: true },
  "9dc97173-285b-4a70-ba06-d8a61e3ae7a7": { ipv4: true },
  "9dcd0523-847b-4b72-a71c-35e03feb4afe": { ipv4: true },
  "9f115cea-a78b-4a00-bc92-142168206cb9": { ipv4: true },
  "a1363224-d6fe-4617-bc25-fa9879cfd7db": { ipv4: true },
  "a2c64481-ccfe-486f-b08c-30f77abc46cf": { ipv4: true },
  "a83878a1-1446-4bef-b53c-8ac0f9410676": { ipv4: true, ipv6: true },
  "c7b71f11-59fa-47ee-afd6-51d075085447": { ipv4: true },
  "dac3377c-57ef-4db1-a703-52001e8d3ae2": { ipv4: true },
  "f08883c4-6a8f-4c75-98fd-62e384170c84": { ipv4: true },
};

export function resolveZincIpCapabilities(
  uuid: string,
  ipv4?: unknown,
  ipv6?: unknown,
): ZincIpCapabilities {
  const fallback = ZINC_NODE_IP_CAPABILITIES[uuid] || {};
  return {
    ipv4: Boolean(ipv4 || fallback.ipv4),
    ipv6: Boolean(ipv6 || fallback.ipv6),
  };
}
