import NewsList from "./NewsListPage";

const Home = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Latest News</h1>

      <NewsList />
    </div>
  );
};

export default Home;
