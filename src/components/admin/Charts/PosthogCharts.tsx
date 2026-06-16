import { Bar, BarChart, XAxis, YAxis, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfigPosthog = {
  count: { label: "Visits" },
};

export function PosthogBarChart({ data, dataKey = "count", nameKey = "name", color = "var(--primary)" }: { data: any[]; dataKey?: string; nameKey?: string; color?: string }) {
  if (!data || data.length === 0) {
    return <div className="text-muted-foreground text-sm flex items-center justify-center h-40">No data available</div>;
  }
  return (
    <div className="h-64 w-full mt-2">
      <ChartContainer config={chartConfigPosthog} className="h-full w-full">
        <BarChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }} layout="vertical">
          <XAxis type="number" hide />
          <YAxis dataKey={nameKey} type="category" tickLine={false} tickMargin={10} axisLine={false} fontSize={11} width={100} />
          <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

const chartConfigArea = {
  count: { label: "Visits" },
};

export function PosthogAreaChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="text-muted-foreground text-sm flex items-center justify-center h-40">No data available</div>;
  }
  return (
    <div className="h-64 w-full mt-2">
      <ChartContainer config={chartConfigArea} className="h-full w-full">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} minTickGap={30} stroke="var(--muted-foreground)" />
          <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={11} stroke="var(--muted-foreground)" />
          <ChartTooltip cursor={{ stroke: 'var(--muted)', strokeWidth: 1, fill: 'transparent' }} content={<ChartTooltipContent />} />
          <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
