import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import { ProblemListPage } from './pages/ProblemList.page';
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
]);

export function Router() {
  return <RouterProvider router={router} />;
}
