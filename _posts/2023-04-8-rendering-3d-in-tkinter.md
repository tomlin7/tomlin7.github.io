---
layout: post
title: "Rendering 3D in tkinter canvas!"
date: 2023-04-08 01:11:00 +0100
tags: tkinter, python
---

Tkinter?! yep that's right, that good ol' python tk gui library is what we're talking about. Known for creating not-so good and modern looking but uh it still gets everything done. Aaand since we're using python, it feels soo easy and simple to create guis with tkinter. So we should definitely render some 3D graphics with the library. But how? and why?

Well, we will be using tkinter's Canvas widget to draw things, we will be drawing only basic shapes for now. Basically, we will be projecting the 3D graphics into a 2D canvas. So there will be some math, some vector stuff. Now, why? well because I like tkinter's simplicity and also its fun, easy to get things done.

So first lets take a look at a 3D cube object

![cube](https://user-images.githubusercontent.com/70792552/230769149-b24e996a-8986-4759-987b-eba48758cdb8.png)

lets note down these vertices into a list

```py
#   5----------1
#  /|         /|
# 4----------0 |
# | |        | |
# | 7--------|-3
# |/         |/
# 6----------2

# cube
vertices = [
    (100, 100, 100),
    (100, 100, -100),
    (100, -100, 100),
    (100, -100, -100),
    (-100, 100, 100),
    (-100, 100, -100),
    (-100, -100, 100),
    (-100, -100, -100)
]
```

Now using the positions of vertices in this list, we can create another list of edges

```py
edges = [
    (0, 1), (0, 2), (0, 4),
    (1, 3), (1, 5),
    (2, 3), (2, 6),
    (3, 7),
    (4, 5), (4, 6),
    (5, 7),
    (6, 7),
]
```

Now we will draw the cube, this will be done by iterating the edges and then using canvas widget's `create_line` method to draw those edges! and to centre the cube somewhat, add an offset too

```py
def draw_cube(vertices, edges):
    for edge in edges:
        x1, y1, z1 = vertices[edge[0]]
        x2, y2, z2 = vertices[edge[1]]
        canvas.create_line(x1 + offset, y1 + offset, x2 + offset, y2 + offset)
```

And now we have our cube rendered!

![image](https://user-images.githubusercontent.com/70792552/230769981-6eea7624-c729-4c2c-8a56-620412648475.png)

## Rotation

The cube doesn't actually look like a cube, right? well thats because we just ignored the Z values, because we had no way to show them off on a canvas. Now one way is to add a scene camera like thing to pivot around the centre. But thats a lot of math, first we will just animate the cube to rotate for us. Now this will require **numpy**, because who would like to do all those vector calculations.

```py
def rotate_x(theta):
    return [
        [1, 0, 0],
        [0, math.cos(theta), -math.sin(theta)],
        [0, math.sin(theta), math.cos(theta)],
    ]

def rotate_y(theta):
    return [
        [math.cos(theta), 0, math.sin(theta)],
        [0, 1, 0],
        [-math.sin(theta), 0, math.cos(theta)],
    ]

def rotate_z(theta):
    return [
        [math.cos(theta), -math.sin(theta), 0],
        [math.sin(theta), math.cos(theta), 0],
        [0, 0, 1],
    ]
...

def animate():
    global vertices

    rotation_matrix = np.dot(rotate_x(0.01), np.dot(rotate_y(0.02), rotate_z(0.03)))
    vertices = [np.dot(rotation_matrix, vertex) for vertex in vertices]

    canvas.delete('all')
    draw_cube(vertices, edges)

    root.after(10, animate)
```

aand our cube, amazing innit?

![python_MGKZnf9l0f](https://user-images.githubusercontent.com/70792552/230770742-511e34af-ce3a-47b4-b046-9e67753de4aa.gif)

That's it for this post! Find the [complete code here](https://gist.github.com/billyeatcookies/96d22e84d13d027205e0dd1ac4b53ae4)
