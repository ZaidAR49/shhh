import { Pie, PieChart, Cell, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfigPie = {
  count: { label: "Secrets" },
};

export function SecretDonut({ data, secretsLabel }: { data: { type: string; count: number; color: string }[]; secretsLabel: string }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="h-44 w-44">
        <ChartContainer config={chartConfigPie} className="h-full w-full aspect-square">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {total}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-[10px] uppercase tracking-wider">
                          {secretsLabel}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
      <div className="flex-1 flex flex-col gap-1.5 w-full">
        {data.map((d) => (
          <div key={d.type} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
            <span className="text-muted-foreground flex-1">{d.type}</span>
            <span className="font-semibold text-foreground">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
