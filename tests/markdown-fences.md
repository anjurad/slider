---
title: Code Fence Split Safety
notes: Ensure '---' inside code fences does not split slides
---

## Slide A

```
This is fenced code.
--- should not split here.
```

Some text after fence.

---

title: Slide B
notes: Second slide should be intact
---

## Slide B Content

```
~~~
Nested style
~~~
```
