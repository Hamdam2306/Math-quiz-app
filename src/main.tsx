import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { MathQuiz } from './components/question.tsx'


createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div >
			<MathQuiz />

		</div>
	</StrictMode>
);
