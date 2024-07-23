---
layout: post
title: "Rendering 3D in tkinter: Rendering Faces and Lighting"
author: "Billy"
tags: tkinter, python
---

So now, we're about to render faces for the cube we rendered, which didn't have any face :"(

![image](https://user-images.githubusercontent.com/70792552/230889367-fc574b89-c99d-43eb-a032-6ab34bb3c4b0.png)


### Quick recap
In last post, we rendered a cube in tkinter canvas, with some vector stuff we were also able to rotate it and give it some animations, the cube only had the edges and circles representing vertices.

Now to render the face, first we can define the faces of the cube, exactly the way we did for edges, using list indices of vertices:
```py
#   5----------1
#  /|         /|
# 4----------0 |
# | |        | |
# | 7--------|-3
# |/         |/
# 6----------2

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

faces = [
    (0, 2, 6, 4),
    (0, 1, 3, 2),
    (0, 4, 5, 1),
    (1, 5, 7, 3),
    (2, 3, 7, 6),
    (4, 6, 7, 5)
]
```

Now before rendering the edges and vertices, we can draw the faces with canvas widget's `create_polygon` method:
```py
def draw_mesh(vertices, edges, faces):
    for  face in faces:
        coords = [(vertices[i][0] + 250, vertices[i][1] + 250) for i in face]
        canvas.create_polygon(coords, fill="grey")
```

![cube with faces](https://user-images.githubusercontent.com/70792552/230891554-f92d5620-f700-4360-8323-a59ac6825c41.gif)

Now lets add some colors shall we!

![cube with colored faces](https://user-images.githubusercontent.com/70792552/230891635-70c7a339-cafd-431a-9ede-85069585751f.gif)


## Lighting
I'm not going to ray trace or something, but simply change the shade of the face based on the angle each face's normal makes with that lightsource.

- define the lightsource vector
- cross the diagonals to get the normal vector to each face
- form a line from light to any of the vertices of face
- dot it with normal, and find the angle bw them
- Now use this angle to determine the shade for the face

![image](https://user-images.githubusercontent.com/70792552/230915633-b7bf2944-0a71-4bb4-b0c1-e80a66b6925b.png)

```py
def draw_mesh(vertices, edges, faces):
    light_source = [500, -500, 500]
    light_vector = np.array(light_source)
    
    for face in faces:
        # crossing the diagonals will give us the normal vector to the face
        v1 = np.array(vertices[face[0]])
        v2 = np.array(vertices[face[1]])
        v3 = np.array(vertices[face[2]])
        normal = np.cross(v2 - v1, v3 - v1)
        
        # now find the angle bw
        to_light = np.array(light_source) - v1
        cos_theta = np.dot(normal, to_light) / (np.linalg.norm(normal) * np.linalg.norm(to_light))
        
        # use the theta value to generate a color
        shade = int(255 * (cos_theta + 1) / 2)
        color = '#{:02x}{:02x}{:02x}'.format(shade, shade, shade)
        
        coords = [(vertices[i][0] + 250, vertices[i][1] + 250) for i in face if isinstance(i, int)]
        canvas.create_polygon(coords, fill=face[4])
```

![cube with shades](https://user-images.githubusercontent.com/70792552/230897796-0ea0fb75-9d49-4c01-8753-1a6ffa877658.gif)

You do notice something is off right, the faces behind are sometimes drawn after the faces on the front are drawn, that makes the cube feel like we can see through. We definitely don't want that, so for now, we will just find which face is closer and draw it very last.

```py
def draw_mesh(vertices, edges, faces):
    ...
    # bit of expensive, but we can optimize it later
    distances = [(sum([np.dot(vertices[face[i]], light_vector) for i in range(len(face))])/3, face) for face in faces]
    distances.sort(reverse=True)

    for _, face in distances:
        ...
```
![ezgif com-video-to-gif (3)](https://user-images.githubusercontent.com/70792552/230898746-a0d5faaf-f773-4889-8047-96d15795e827.gif)

now lets try drawing those edges and vertices too:

![ezgif com-video-to-gif (4)](https://user-images.githubusercontent.com/70792552/230899029-c642e875-486c-418f-bb27-127fd647a3b9.gif)

and thats all for this post! we have some blender default cube spinning in nowhere in the end, heehoo!

as always, find the [complete code here](https://gist.github.com/billyeatcookies/a60fe615253ca8af7cdbf0fc94f5e021)
