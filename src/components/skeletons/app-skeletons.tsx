import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-4 w-[80px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <Skeleton className="h-6 w-[150px]" />
      </CardHeader>
      <CardContent className="pl-2">
        <Skeleton className="h-[350px] w-full rounded-xl" />
      </CardContent>
    </Card>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="h-12 border-b bg-muted/50 px-4 flex items-center">
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between space-x-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function IncomeMatrixSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-8 w-[150px]" />
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 p-4 overflow-hidden">
          {/* Month Labels */}
          <div className="flex flex-col space-y-2 pt-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-16" />
            ))}
          </div>
          {/* Year Columns */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-2 min-w-[120px]">
              <Skeleton className="h-10 w-full mb-2" />
              {Array.from({ length: 12 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
