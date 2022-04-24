---
Title: ERIL
---

# ERIL

## Intro
ERIL is a new programming language project I'm starting. The goal is to rewrite [lowlang](/projects#lowlang) so that it
is easier to add new features and to understand how it works. To understand why I'm creating this, let's first take a
look at how memory and datatypes work in programming.

## Memory
A computer makes use of bits to store data, these can be either 0 or 1. A group of 8 bits is known as a byte. A CPU has
different integer datatypes it can use to do calculations. These are 8 bits, 16 bits, 32 bits and on many modern CPUs
also 64 bits and sometimes even 128 bits. These integer datatypes are usually placed in CPU registers, however there are
only a limited number of these. When all registers are in use any new values are placed on the stack, which can increase
in size to store more values. Values on the stack are always accessed by use of a reference or memory address, whereas
values in registes can be used directly. When generating assembly it is very improtant to take all of this into
account. It is also very important that the datatypes of all values in a program are known before generating assembly,
because the assembly instructions differ for different datatypes.

## Generics
Because all types need to be known before generating the assembly, many programming languages require the user to enter
the types of variables, function parameters, etc. But what if you want a certain function to work for multiple differnt
types? Each of those different datatypes might be a differnt number of bits, or use different assembly instruction to
work with them. However, the assembly genrated for a function is always the same. The way modern programming languages
solve this problem is by parameterizing the entire function definition by "type parameters". This feature is also known
as "generics", as it generalizes the function definition. Turning these generic function into assembly can be done in
two ways, the first being monomorphization. With monomorphization a polymorphic (generic) function is turned into a
monomorphic (non-generic) function for every datatypes it is used with. So if a generic function is used with two
datatypes, one of 16 bits and one of 64 bits, then two copies of that function will be generated, one which works only
for the 16 bit datatypes and one that works only for the 64 bit datatype. This method has the advantage of being very
simple to implement and each of the copied functions can also be optimized individually. The downside is that now the
assembly for a function has to be generated multiple times, which will take more time and also increase the size of the
final binary file. It is also harder for other libraries to make use of these functions since they would have to
generate even more copies for any of their own custom datatypes.

## The solution
The only other way to have the same code work with multiple datatypes is to only access values of those types indirectly
through pointers or references. This usually means that before passing a value to a generic function it is first placed
on the stack, and the memory address of that values is then passed to the function. This works because pointer values
always use the smae number of bits and use the same assembly instructions. But this only solves half of the problem. Now
the function can receive values of any type, but it can't do anything with them. The way this can be solved is by also
passing in functions that perform operations on the datatypes indirectly. An example: say our generic function wants to
add two values of generic type T. Then two pointers to a value T will have to be pased to the function and a pointer to
a location in memory where the result can be stored, as well as a pointer to a function that can add two values of type
T. In the C programming language that would look something like this:

```c
// generic function
void add(T* ret, T* a, T* b, void *add_T(T*, T*, T*)) {
    add_T(ret, a, b);
}

int add_int(int a, int b) 
    return a + b;
}

// usage
int a = 3;
int b = 5;
int ret;

add(&ret, &a, &b, add_int);
```

#### Continue reading

* [Memory Layout](/eril/memory-layout)
