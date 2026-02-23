import { getStudentsByCourse } from "@/lib/db/enrollments";

export const dynamic = "force-dynamic";

export default async function CourseStudentsPage({
  params,
}: {
  params: { id: string };
}) {
  const students = await getStudentsByCourse(params.id);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">კურსის სტუდენტები</h1>

      {students.length === 0 ? (
        <p className="mt-4 text-white/70">ჯერ არცერთი სტუდენტი არ არის ჩაწერილი.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-3 py-2 text-left">სახელი</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">სტატუსი</th>
                <th className="px-3 py-2 text-left">ჩაწერის თარიღი</th>
              </tr>
            </thead>

            <tbody>
              {students.map((row, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="px-3 py-2">
                    {row.student?.full_name ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    {row.student?.email ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    {row.status}
                  </td>
                  <td className="px-3 py-2 text-white/70">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}