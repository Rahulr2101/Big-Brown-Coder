import React from 'react';
import { Line, LineChart as RechartsLineChart, ResponsiveContainer } from 'recharts';



const LineChart = ({ data, color }) => {
  return (
    <ResponsiveContainer width="100%" height={50}>
      <RechartsLineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2} 
          dot={false}
          isAnimationActive={true}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
