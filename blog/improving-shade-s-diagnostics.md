---
Title: Improving Shade's Diagnostics
Created: 19-03-2022
---

## Intro
For anyone who doesn't yet know, [Shade][shade] is a programming language compiler I've been working on. The language's
features are all heavily inspired by different functional programming languages ([Haskell][hs], [Purescript][ps],
[ante][ante]) as well as the [Rust][rs] programming language and [Vale][vale]. This project is still very much in
progress. In this post I will the describe how I've changed the typechecker to allow for better error messages
(diagnostics).

## How does the typechecker work?
Just like a lot of other modern programming languages Shade uses an adaptation of the [Hindley-Milner][hm] algorithm.
This algorithm consists of three steps. First, every item in the code is assigned a type variable, these type variables
are unique for every item. Then, constraints are placed on those type variables based on the item. And finally, those
constraints are solved and all type variables are substituted with the actual types. Any constraints that couldn't be
solved are reported as type errors. In Shade this algorithm is changed by immediately returning the type of an item if
that type is know and type variables and constraints are assigned at the same time. The implementation of this
typechecker has been greatly inspired by [Purescript][ps], which has exactly the features I wanted to have in Shade.

Here is a simple example:
```constraints
a + b
```
Here we have two values: a and b, which are added together. First these three items are assigned type variables:
```constraints
a: ?0
b: ?1
(a + b): ?2
```
Based on the addition two constraints can be placed on these type variables:
```constraints
?0 == ?1
?2 == ?0
```
After solving these constraints we get the following set of substitutions:
```constraints
?1 -> ?0
?2 -> ?0
```
Finally, these substitution can be applied to get the final types for all the items:
```constraints
a: ?0
b: ?0
(a + b): ?0
```
Of course by the end of typechecking the `?0` will also have been replaced by an actual type, resulting in a fully type
checked program.

## The new typechecker
Previously, when constraints couldn't be solved an error would be reported at the item where the constraint was
generated. After testing however, it turned out that this isn't alwasy correct. Sometimes the types that causes the
error might originate elsewhere, but the error message wouldn't tell you this. This is because the compiler doesn't
track the source location for every type, it only uses the source loation of the constraint. In order to know exactly
what piece of code created the type that causes an error, the source location for every type in the program would have
to be known. For this reason the internal representation of types in the compiler has been changed to do exactly this.
Now, when an error is found the source location of all the types involved can be requested and  can be used in the error
message to tell the user exactly where things go wrong.

[hm]: https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system
[hs]: https://www.haskell.org/
[ps]: https://www.github.com/purescript/purescript
[rs]: https://www.rust-lang.org/
[ante]: http://antelang.org/
[shade]: /projects#shade
[vale]: https://vale.dev/
