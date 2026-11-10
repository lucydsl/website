// Teach Prism the Lucy language, and Lucy inside JavaScript tagged
// templates. Both the markdown highlighter and the <Prism> component use
// this one Prism instance.
import Prism from 'prismjs';
import { lucy, lucyTemplate } from '@lucy/prism';

if (!Prism.languages.lucy) {
  lucy(Prism);
  lucyTemplate(Prism);
}
