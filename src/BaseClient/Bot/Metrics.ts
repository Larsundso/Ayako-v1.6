import { scheduleJob } from 'node-schedule';
import { Counter, Gauge, Registry } from 'prom-client';

export const registry = new Registry();

const dispatchEventsReceived = new Counter({
 name: 'ayako_gateway_dispatch_events',
 help: 'Individual dispatch events received',
 labelNames: ['clientName', 'eventType', 'shard'],
});

const shardLatency = new Gauge({
 name: 'ayako_gateway_shard_latency',
 help: 'Latency of each shard',
 labelNames: ['clientName', 'shard'],
});

const shardEventsReceived = new Counter({
 name: 'ayako_gateway_shard_receive_events',
 help: 'Individual shard events received',
 labelNames: ['clientName', 'opCode', 'shard'],
});

registry.registerMetric(dispatchEventsReceived);
registry.registerMetric(shardLatency);
registry.registerMetric(shardEventsReceived);

export const metrics = {
 dispatchEventsReceived,
 shardLatency,
 shardEventsReceived,
};

export const gatewayMetricsCollector = {
 dispatchEventsReceived: (clientName: string, eventType: string, shard: number) => {
  metrics.dispatchEventsReceived.labels(clientName, eventType, String(shard)).inc();
 },
 shardLatency: (clientName: string, shard: number, latency: number) => {
  metrics.shardLatency.labels(clientName, String(shard)).set(latency);
 },
 shardEventsReceived: (clientName: string, opCode: string, shard: number) => {
  metrics.shardEventsReceived.labels(clientName, opCode, String(shard)).inc();
 },
};

scheduleJob('metrics', '*/5 * * * * *', async () => {
 const metrics = await registry.metrics();

 fetch('https://api.ayakobot.com/metrics', {
  method: 'POST',
  body: JSON.stringify({ metrics, instanceId: 'Ayako - Manager' }),
  headers: { authorization: process.env.MetricsSecret ?? '', 'Content-Type': 'application/json' },
 }).then(async (res) => res.ok ? undefined : console.log(await res.text()))
});