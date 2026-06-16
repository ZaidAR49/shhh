import { Bar, BarChart, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfigBar = {
  count: { label: "Signups", color: "var(--accent)" },
};

export function MiniBarChart({ data }: { data: { month: string; count: number }[] }) {
  return (
    <div className="h-40 w-full mt-2">
      <ChartContainer config={chartConfigBar} className="h-full w-full">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} fontSize={10} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
