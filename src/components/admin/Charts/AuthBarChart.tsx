import { Bar, BarChart, XAxis, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfigAuthBar = {
  count: { label: "Accounts" },
};

export function AuthBarChart({ data }: { data: { provider: string; count: number; color: string }[] }) {
  return (
    <div className="h-40 w-full mt-2">
      <ChartContainer config={chartConfigAuthBar} className="h-full w-full">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="provider" tickLine={false} tickMargin={10} axisLine={false} fontSize={10} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
