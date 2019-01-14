
Architecture:
- Global state not seen as a good thing: we want to decouple the components
- ... so each component may have its own, redundant copy of the cell or gene data: We might actually use the same data structure for each of them, but that’s not an assumption we want to build on.

Choices:
- Mobx?
- PubsubJS?
- Redux?
