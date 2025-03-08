
import React from 'react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer } from 'recharts';



const BarChart = ({ 
  data, 
  color, 
  highlightIndex, 
  highlightColor = '#5ECFCA' 
}) => {
  return (
    <ResponsiveContainer width="100%" height={70}>
      <RechartsBarChart data={data}>
        <Bar 
          dataKey="value" 
          fill={color}
          radius={[4, 4, 0, 0]}
          shape={(props) => {
            const { x, y, width, height, index } = props;
            return (
              <rect 
                x={x} 
                y={y} 
                width={width} 
                height={height} 
                fill={index === highlightIndex ? highlightColor : color} 
                radius={[4, 4, 0, 0]}
              />
            );
          }}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
