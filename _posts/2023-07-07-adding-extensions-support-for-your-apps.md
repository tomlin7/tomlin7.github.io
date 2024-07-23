---
layout: post
title: "Adding Extensions Support for Your Apps!"
date: 2023-07-07 01:11:00 +0100
categories: extensions, python
---

**Extensions** has been a very popular and trending concept in customizable applications development. It extends the app's functionality and features, and tweaks different parts of the application to work as the user wants it to. Most of the modern apps have support for extensions. So, let's break it down. How do they work? how are they managed and shared across the users pretty easily? How do they integrate with the apps pretty well!?
To breal it down, we will be creating a very similar system with python in this post.

## The Extensions API!

For the extensions to integrate and communicate with the editor perfectly and efficiently, there should be a strong and safe extensions API available!

```py
# extension_api.py
class ExtensionAPI:
    def hello_world(self):
        print("Hello world!")

    def do_something(self):
        # access some component of the app
        ...
```

This API can be made more accessible and rich by adding many more endpoints and many more functions! for now, we have a `hello_world` function as an example.

## The extension Manager

The extensions manager's duty is to load/unload/run the extensions available. **importlib**(builtin lib) is used to import the extension script file from a specific directory made for extensions where the app will look for extensions.

```py
# extension_manager.py
import importlib
import os

class ExtensionManager:
    def __init__(self):
        self.extensions  = []

    def load_extensions(self, extensions_directory, api):
        extension_files = os.listdir(extensions_directory)
        for extension_file in extension_files:
            if extension_file.endswith(".py"):
                extension_name = os.path.splitext(extension_file)[0]
                module_name = f"extensions.{extension_name}"
                try:
                    extension_module = importlib.import_module(module_name)
                    # pass the api reference!
                    extension_instance = extension_module.extension(api)
                    self.extensions.append(extension_instance)
                    print(f"extension '{extension_name}' loaded.")
                except ImportError:
                    print(f"Failed to load extension '{extension_name}'.")

    def run_extensions(self):
        for extension in self.extensions:
            extension.run()
```

This extension manager doesn't have the feature to load/run specific extensions yet, but it checks and loads all the scripts inside the `extensions` directory. This can be run on a different thread if the app has a GUI main loop running in the main thread, for example in the case of a tkinter app.

## The Extension Structure

To access the API, reference of the api instance will be passed to the extension as well! For now, the class shall be named `Extension` as we are checking for the specifically named class in the extensions manager.

```py
# extensions/hello.py
class Extension:
    def __init__(self, api):
        self.api = api

    def run(self):
        print("Extension is accessing the application's extensions API.")
        self.api.hello_world()
```

Functions that are executed when the app starts up can be called during the extension's initialization as well, this won't affect the app as it can be made to run in a separate thread. You can also extend this setup to add different event listeners with the API to decide when the extension will fire up! (eg. when a specific type of file is handled, x extension to be started).

## Integrating with the Application

The final step will be adding the functionality to your application, to demonstrate, I will be running the sample hello extension for now!

```py
import os
from extension_api import ExtensionAPI
from extension_manager import ExtensionManager

api = ExtensionAPI()
manager = ExtensionManager()

extensions_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "extensions")
manager.load_plugins(extensions_directory, api)

manager.run_plugins()
```

## Multithreading the Extensions Manager!

As mentioned above, there can be cases where the extensions may be run aside a gui application, or when the extensions do time consuming I/O tasks, this can lag the app quite a big. Hence we run the extensions on a different thread aside from the main thread.

```py
import threading
...

thread=threading.Thread(target=manager.run_plugins)
thread.start()

...
# handle the main loop

thread.join()
```

## Malicious extensions!?

Another question that may asked here is, what about the safety of extensions? extensions can be malicious since they are simply python scripts!?

This is the point where we move on to making the extensions manager run the extensions in a sandboxed environment! I was planning to demonstrate this with the [**pysandbox**](https://github.com/vstinner/pysandbox) but the library is now marked as "broken by design", you can read up further on it. There are some alternatives but none has been able to do this task perfectly. So this issue will remain unsolved.

Aaaand that will be it! You will have a very basic extensions manager and API set up for your app! Now the task is to extend the API further to make it more accessible ❤
