import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import { ProblemListPage } from './pages/ProblemList.page';
import { ResultPage } from './pages/Result.page';
import { TacklePage } from './pages/Tackle.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/:workbookId/problemList',
    element: <ProblemListPage />,
  },
  {
    path: '/tackle/:workbookId/:problemListId',
    element: <TacklePage />,
  },
  {
    path: '/result/:resultId',
    element: <ResultPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
