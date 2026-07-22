import { describe, expect, it } from "vitest";
import { updateIpQueue, IpRecord } from "@/lib/ip";

describe("IP queue recording logic", () => {
  it("should append a new IP record when queue is empty", () => {
    const queue: IpRecord[] = [];
    const updated = updateIpQueue(queue, "1.1.1.1", "2026-07-22T10:00:00Z");

    expect(updated).toEqual([{ ip: "1.1.1.1", at: "2026-07-22T10:00:00Z" }]);
  });

  it("should update timestamp if the same IP is requested consecutively", () => {
    const queue: IpRecord[] = [{ ip: "1.1.1.1", at: "2026-07-22T10:00:00Z" }];
    const updated = updateIpQueue(queue, "1.1.1.1", "2026-07-22T10:05:00Z");

    expect(updated).toEqual([{ ip: "1.1.1.1", at: "2026-07-22T10:05:00Z" }]);
    expect(updated.length).toBe(1);
  });

  it("should maintain at most 5 records when pushing distinct IPs", () => {
    let queue: IpRecord[] = [];
    const ips = [
      "192.168.1.1",
      "192.168.1.2",
      "192.168.1.3",
      "192.168.1.4",
      "192.168.1.5",
      "192.168.1.6", // 6th IP
      "192.168.1.7"  // 7th IP
    ];

    for (const ip of ips) {
      queue = updateIpQueue(queue, ip, new Date().toISOString());
    }

    expect(queue.length).toBe(5);
    expect(queue[0].ip).toBe("192.168.1.3");
    expect(queue[4].ip).toBe("192.168.1.7");
  });
});
