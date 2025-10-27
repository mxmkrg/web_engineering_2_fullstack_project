"use client";

import {useRouter} from "next/navigation";
import {Activity, TrendingUp, Calendar, Users} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import FloatingAssistant from "./FloatingAssistant";

interface DashboardContentProps {
    userName: string;
}

export function DashboardContent({userName}: DashboardContentProps) {
    const router = useRouter();

    const stats = [
        {
            title: "Total Workouts",
            value: "0",
            description: "Workouts completed",
            icon: Activity,
            color: "text-blue-600",
        },
        {
            title: "This Week",
            value: "0",
            description: "Workouts this week",
            icon: Calendar,
            color: "text-green-600",
        },
        {
            title: "Average Duration",
            value: "0m",
            description: "Per workout",
            icon: TrendingUp,
            color: "text-purple-600",
        },
        {
            title: "Active Streak",
            value: "0",
            description: "Days in a row",
            icon: Users,
            color: "text-orange-600",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="space-y-6">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
                    <p className="text-muted-foreground">
                        Track your workouts and monitor your fitness progress
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`}/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Action Card */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Quick Start</CardTitle>
                            <CardDescription>
                                Ready to begin your fitness journey?
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <button
                                    onClick={() => router.push("/dashboard/workouts" as any)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    <Activity className="size-5"/>
                                    Start Your First Workout
                                </button>
                                <p className="text-sm text-muted-foreground text-center">
                                    Track exercises, sets, reps, and weights to monitor your
                                    progress over time.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Your workout history will appear here
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6">
                                <Activity className="size-12 text-muted-foreground mx-auto mb-3"/>
                                <p className="text-sm text-muted-foreground">
                                    No workouts yet. Create your first workout to see your activity
                                    here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Feature Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Coming Soon</CardTitle>
                        <CardDescription>
                            Features we're working on to enhance your fitness journey
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg border">
                                <TrendingUp className="size-8 text-green-600"/>
                                <div>
                                    <h4 className="font-medium">Progress Tracking</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Visual progress charts and analytics
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg border">
                                <Calendar className="size-8 text-purple-600"/>
                                <div>
                                    <h4 className="font-medium">Workout Scheduling</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Plan and schedule your workouts
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg border">
                                <Users className="size-8 text-orange-600"/>
                                <div>
                                    <h4 className="font-medium">Goal Setting</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Set and track fitness goals
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <FloatingAssistant/>
            </div>
        </div>
    );
}
