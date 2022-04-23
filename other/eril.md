---
Title: ERIL
---

# ERIL

## Intro
ERIL is a new programming language project I'm starting. The goal is to rewrite [lowlang][lowlang] so that it is easier
to add new features and to understand how it works. To understand why I'm creating this, let's first take a look at how
memory and datatypes work in programming.

## Memory
A computer makes use of bits to store data, these can be either 0 or 1. A group of 8 bits is known as a byte. A CPU has
different integer datatypes it can use to do calculations. These are 8 bits, 16 bits, 32 bits and on many modern CPUs
also 64 bits and sometimes even 128 bits. These integer datatypes are usually placed in CPU registers, however there are
only a limited number of these. When all registers are in use any new values are placed on the stack, which can increase
in size to store more values. Values on the stack are always accessed by use of a reference or memory address, whereas
values in registes can be used directly. When generating assembly it is very improtant to take all of this into
account. It is also very important that the datatypes of all values in a program are known before generating assembly,
because the assembly instructions differ for different datatypes.


[lowlang]: /projects#lowlang
