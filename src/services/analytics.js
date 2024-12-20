import { getPerformance } from 'firebase/performance';

const perf = getPerformance();
const trace = perf.trace('critical_app_action');

export const measurePerformance = async (action) => {
  trace.start();
  await action();
  trace.stop();
}; 