import { getServerSession } from "@/lib/auth-server";
import type { DateFilter } from "@/actions/get-progression-stats";
import { ProgressionOverview } from "./_components/progression-overview";
import { ExerciseProgressionCharts } from "./_components/exercise-progression-charts";
import { MuscleGroupStats } from "./_components/muscle-group-stats";
import { PersonalRecordsTimeline } from "./_components/personal-records-timeline";
import { CalendarDateFilter } from "./_components/calendar-date-filter";

interface ProgressPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function parseDateFilterFromParams(
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>,
): Promise<DateFilter> {
  const params = await searchParams;
  const type = (params.filter_type as DateFilter["type"]) || "all-time";
  const label = (params.filter_label as string) || "All Time";
  const startDateStr = params.start_date as string;
  const endDateStr = params.end_date as string;

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startDateStr && endDateStr) {
    startDate = new Date(startDateStr);
    endDate = new Date(endDateStr);
  }

  return {
    type,
    label,
    startDate,
    endDate,
  };
}

export default async function ProgressPage({
  searchParams,
}: ProgressPageProps) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">
          Please log in to view your progress.
        </p>
      </div>
    );
  }

  const dateFilter = await parseDateFilterFromParams(searchParams);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
          <p className="text-muted-foreground">
            Analyze your fitness journey and track improvements (only saved
            workouts)
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="max-w-2xl">
        <CalendarDateFilter currentFilter={dateFilter} />
      </div>

      <div className="space-y-6">
        {/* Overview Stats */}
        <ProgressionOverview userId={session.user.id} dateFilter={dateFilter} />

        {/* Muscle Group Balance */}
        <MuscleGroupStats userId={session.user.id} dateFilter={dateFilter} />

        {/* Exercise Progression Charts */}
        <ExerciseProgressionCharts
          userId={session.user.id}
          dateFilter={dateFilter}
        />

        {/* Personal Records Timeline */}
        <PersonalRecordsTimeline
          userId={session.user.id}
          dateFilter={dateFilter}
        />
      </div>
    </div>
  );
}
