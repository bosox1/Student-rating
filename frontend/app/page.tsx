import RatingTable from "./components/RatingTable";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Student rating</h1>
      <RatingTable />
    </main>
  );
}
