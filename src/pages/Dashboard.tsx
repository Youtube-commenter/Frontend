
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, MessageSquare, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  // Mock data for charts and stats
  const commentStats = [
    { name: "Mon", comments: 4 },
    { name: "Tue", comments: 3 },
    { name: "Wed", comments: 5 },
    { name: "Thu", comments: 7 },
    { name: "Fri", comments: 2 },
    { name: "Sat", comments: 6 },
    { name: "Sun", comments: 8 },
  ];

  const statCards = [
    {
      title: "Comments Posted",
      value: "35",
      change: "+12% from last week",
      icon: MessageSquare,
      iconClass: "text-blue-500 bg-blue-100",
    },
    {
      title: "Connected Accounts",
      value: "8",
      change: "2 inactive",
      icon: UserCheck,
      iconClass: "text-green-500 bg-green-100",
    },
    {
      title: "Disconnected Accounts",
      value: "3",
      change: "1 new since yesterday",
      icon: UserX,
      iconClass: "text-red-500 bg-red-100",
    },
    {
      title: "Active Planners",
      value: "12",
      change: "4 due today",
      icon: Calendar,
      iconClass: "text-purple-500 bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your YouTube Auto Commenter activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`p-2 rounded-full ${card.iconClass}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Comment Activity</CardTitle>
            <CardDescription>Number of comments posted per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="comments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>YouTube API Quota Usage</CardTitle>
            <CardDescription>Daily API consumption (10,000 units limit)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Comments</span>
                <span>2,500 units</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Account Management</span>
                <span>1,200 units</span>
              </div>
              <Progress value={12} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Video Data</span>
                <span>800 units</span>
              </div>
              <Progress value={8} className="h-2" />
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between font-medium">
                <span>Total Used</span>
                <span>4,500 / 10,000 units (45%)</span>
              </div>
              <Progress value={45} className="h-3 mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
