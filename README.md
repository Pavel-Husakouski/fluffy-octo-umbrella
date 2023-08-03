# fluffy-octo-umbrella
An experimental library for task scheduling

## The goal
The main purpose is to gain an idea of how to solve event loop issues when rendering content of monstrous size.
The restrictions
*. the content rendering is made on the same instance of node
*. the content rendering is unable to be moved to webasm

The desirable capabilities:  
* allow parallel processing
* ability to change the priority of tasks that render the content
* ability to stop and resume any logical task

## Main questions
* how the renderer code should look like
* how the scheduler should look like

