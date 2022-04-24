---
Title: Memory Layout
---

# Memory Layout

## Layout properties
The **size** of a datatype is simply the number of bytes it takes to store a value of that type. The **alignment** for a
type is a bit more complex: the memory address of a value of that type module the alignment must be zero. The
**alignment** must always be a power of two. **Stride** is the **size** rounded up to the **alignment**. Memory layout
also includes the offsets for different fields in a type.

## Opaque layouts
To determine the layout of a type, everything about that type must be known. However, this is not always the case, such
as with generic types. When a type is generic we can say that it's layout is **opaque**. This means that the layout of
that type cannot be known before all the generic parameters are known.

### Some examples
Say we have the type `Int32`, which is a 32 bit number. It's size will be 4 bytes, and it's alignment and
**stride** as well. Another type is `Bool`, which is 1 byte in side, alignment and stride. It is also possible to
combine multiple types into a **struct** like so: `{ a: Bool, b: Int32 }`. This struct consists of two **fields**: `a`
of type `Bool` and `b` of type `Int32`. If you add the two sizes for Bool and Int32 you will get a size of 5 bytes, but
this is incorrect. That's because of the alignment of Int32 (4), since it comes after the Bool with an alignment of 1.
To properly align the Int32, 3 bytes of **padding** will have to be added in between the fields. This will result in a
total size of 8 bytes, with an alignment of 4 (the largest alignment of all fields) and a stride of 8. The **offsets**
of the fields will be as follows: `a` has offset 0 and `b` has offset 4 because of the 3 bytes padding.

An opaque layout would look something like this: `<T> { a: Int32, b: T }`, which is a generic struct with fields `a` of
type `Int32` and `b` of (generic) type `T`. In this case the size, alignment and stride are all unknown. However, the
offset for field `a` is known because it will always be 0. The offset for field `b` is still unknown because we don't
know it's alignment.

## Runtime layout
Normally the layout of a datatype is determined at compile time (before any of the assembly is generated). But as
explained before, that is not always possible because of opaque layouts. The final layout of an opaque layout can only
be computed at runtime (when the code is run). To do this an opaque layout could be turned into some sort of template,
which the layouts of the generic parameters as inputs. These templates are simply functions that compute the layout for
that specific type.
