"use client"
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button, ButtonProps } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clipboard, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PageWrapper from "@/components/wrapper/page-wrapper";
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  CalendarIcon,
  EnvelopeClosedIcon,
  FaceIcon,
  GearIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Textarea } from '@/components/ui/textarea';
import FloatingBadge from "../components/floating-badge"
import { Slider } from "@/components/ui/slider"
import { HexColorPicker } from "react-colorful";

type OptionType = {
  name: string;
  type: 'text' | 'select' | 'boolean' | 'function' | 'slider' | 'color';
  label: string;
  default: string | boolean | number | any;
  options?: string[];
  render?: (value: any) => Partial<ButtonProps>;
  min?: number;  // Add this line
  max?: number;  // Add this line
}

type ComponentConfig = {
  name: string;
  import: string;
  component: React.ComponentType<any>;
  render: (props: any) => React.ReactElement;
  options: OptionType[];
}

type ComponentsConfig = {
  [key: string]: ComponentConfig;
}

const componentsConfig: ComponentsConfig = {
  button: {
    name: 'Button',
    import: 'import { Button } from "@/components/ui/button"',
    component: Button,
    render: (props: ButtonProps & { roundness: number; backgroundColor: string; textColor: string; useCustomColors: boolean }) => (
      <Button
        {...props}
        className={`${props.className || ''}`}
        style={{
          borderRadius: `${props.roundness}px`,
          ...(props.useCustomColors && {
            backgroundColor: props.backgroundColor,
            color: props.textColor,
          }),
        }}
      >
        {props.children}
      </Button>
    ),
    options: [
      {
        name: 'children',
        type: 'text',
        label: 'Button Text',
        default: 'Click me'
      },
      {
        name: 'variant',
        type: 'select',
        label: 'Variant',
        options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
        default: 'default'
      },
      {
        name: 'size',
        type: 'select',
        label: 'Size',
        options: ['default', 'sm', 'lg'],
        default: 'default'
      },
      {
        name: 'loading',
        type: 'boolean',
        label: 'Loading State',
        default: false,
        render: (isLoading: boolean) => isLoading ? {
          disabled: true,
          children: (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          )
        } : {}
      },
      {
        name: 'roundness',
        type: 'slider',
        label: 'Roundness',
        default: 4,
        min: 0,
        max: 20
      },
      {
        name: 'useCustomColors',
        type: 'boolean',
        label: 'Use Custom Colors',
        default: false
      },
      {
        name: 'backgroundColor',
        type: 'color',
        label: 'Background Color',
        default: '#000000'
      },
      {
        name: 'textColor',
        type: 'color',
        label: 'Text Color',
        default: '#ffffff'
      }
    ]
  },
  dialog: {
    name: 'Dialog',
    import: `import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"`,
    component: Dialog,
    render: (props: { triggerText: string; title: string; description: string; children: React.ReactNode }) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">{props.triggerText}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogDescription>{props.description}</DialogDescription>
          </DialogHeader>
          {props.children}
        </DialogContent>
      </Dialog>
    ),
    options: [
      {
        name: 'triggerText',
        type: 'text',
        label: 'Trigger Button Text',
        default: 'Open Dialog'
      },
      {
        name: 'title',
        type: 'text',
        label: 'Dialog Title',
        default: 'Are you absolutely sure?'
      },
      {
        name: 'description',
        type: 'text',
        label: 'Dialog Description',
        default: 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.'
      },
      {
        name: 'children',
        type: 'text',
        label: 'Dialog Content',
        default: 'Add your dialog content here.'
      }
    ]
  },
  accordion: {
    name: 'Accordion',
    import: `import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"`,
    component: Accordion,
    render: (props: { items?: { trigger: string; content: string }[]; type: 'single' | 'multiple'; collapsible: boolean }) => (
      <Accordion type={props.type} collapsible={props.collapsible} className="w-full">
        {(props.items || []).map((item, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`}>
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    ),
    options: [
      {
        name: 'type',
        type: 'select',
        label: 'Accordion Type',
        options: ['single', 'multiple'],
        default: 'single'
      },
      {
        name: 'collapsible',
        type: 'boolean',
        label: 'Collapsible',
        default: true
      },
      {
        name: 'items',
        type: 'function',
        label: 'Accordion Items',
        default: [
          { trigger: 'Is it accessible?', content: 'Yes. It adheres to the WAI-ARIA design pattern.' },
          { trigger: 'Is it styled?', content: 'Yes. It comes with default styles that matches the other components\' aesthetic.' },
          { trigger: 'Is it animated?', content: 'Yes. It\'s animated by default, but you can disable it if you prefer.' }
        ]
      }
    ]
  },
  alert: {
    name: 'Alert',
    import: `import { RocketIcon } from "@radix-ui/react-icons"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"`,
    component: Alert,
    render: (props: { title: string; description: string; variant: 'default' | 'destructive' }) => (
      <Alert variant={props.variant}>
        <RocketIcon className="h-4 w-4" />
        <AlertTitle>{props.title}</AlertTitle>
        <AlertDescription>{props.description}</AlertDescription>
      </Alert>
    ),
    options: [
      {
        name: 'title',
        type: 'text',
        label: 'Alert Title',
        default: 'Heads up!'
      },
      {
        name: 'description',
        type: 'text',
        label: 'Alert Description',
        default: 'You can add components to your app using the cli.'
      },
      {
        name: 'variant',
        type: 'select',
        label: 'Variant',
        options: ['default', 'destructive'],
        default: 'default'
      }
    ]
  },
  popover: {
    name: 'Popover',
    import: `import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"`,
    component: Popover,
    render: (props: { triggerText: string; content: string }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">{props.triggerText}</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Popover Content</h4>
              <p className="text-sm text-muted-foreground">{props.content}</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    ),
    options: [
      {
        name: 'triggerText',
        type: 'text',
        label: 'Trigger Text',
        default: 'Open Popover'
      },
      {
        name: 'content',
        type: 'text',
        label: 'Popover Content',
        default: 'Place content for the popover here.'
      }
    ]
  },
  command: {
    name: 'Command',
    import: `import {
  CalendarIcon,
  EnvelopeClosedIcon,
  FaceIcon,
  GearIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"`,
    component: Command,
    render: (props: {
      placeholder: string;
      emptyMessage: string;
      groups: Array<{
        heading: string;
        items: Array<{
          icon: string;
          label: string;
          shortcut?: string;
        }>;
      }>;
    }) => (
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder={props.placeholder} />
        <CommandList>
          <CommandEmpty>{props.emptyMessage}</CommandEmpty>
          {props?.groups?.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && <CommandSeparator />}
              <CommandGroup heading={group.heading}>
                {group.items.map((item, itemIndex) => (
                  <CommandItem key={itemIndex}>
                    {getIcon(item.icon)}
                    <span>{item.label}</span>
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </Command>
    ),
    options: [
      {
        name: 'placeholder',
        type: 'text',
        label: 'Input Placeholder',
        default: 'Type a command or search...'
      },
      {
        name: 'emptyMessage',
        type: 'text',
        label: 'Empty Message',
        default: 'No results found.'
      },
      {
        name: 'groups',
        type: 'function',
        label: 'Command Groups',
        default: [
          {
            heading: 'Suggestions',
            items: [
              { icon: 'CalendarIcon', label: 'Calendar' },
              { icon: 'FaceIcon', label: 'Search Emoji' },
              { icon: 'RocketIcon', label: 'Launch' },
            ]
          },
          {
            heading: 'Settings',
            items: [
              { icon: 'PersonIcon', label: 'Profile', shortcut: '⌘P' },
              { icon: 'EnvelopeClosedIcon', label: 'Mail', shortcut: '⌘B' },
              { icon: 'GearIcon', label: 'Settings', shortcut: '⌘S' },
            ]
          }
        ]
      }
    ]
  }
};

const getIcon = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    CalendarIcon: <CalendarIcon className="mr-2 h-4 w-4" />,
    EnvelopeClosedIcon: <EnvelopeClosedIcon className="mr-2 h-4 w-4" />,
    FaceIcon: <FaceIcon className="mr-2 h-4 w-4" />,
    GearIcon: <GearIcon className="mr-2 h-4 w-4" />,
    PersonIcon: <PersonIcon className="mr-2 h-4 w-4" />,
    RocketIcon: <RocketIcon className="mr-2 h-4 w-4" />,
  };
  return icons[iconName] || null;
};

const ColorPicker: React.FC<{ color: string; onChange: (color: string) => void }> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[280px] justify-start text-left font-normal"
        >
          <div
            className="w-4 h-4 rounded-full mr-2 shrink-0"
            style={{ backgroundColor: color }}
          />
          {color}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <HexColorPicker color={color} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
};


const ComponentRenderer: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string>(Object.keys(componentsConfig)[0]);
  const [componentOptions, setComponentOptions] = useState<Record<string, any>>({});

  useEffect(() => {
    const defaultOptions: Record<string, any> = {};
    componentsConfig[selectedComponent].options.forEach(option => {
      defaultOptions[option.name] = option.default;
    });
    setComponentOptions(defaultOptions);
  }, [selectedComponent]);

  const renderOptionInput = (option: OptionType) => {
    switch (option.type) {
      case 'text':
        return (
          <Input
            value={componentOptions[option.name]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComponentOptions({ ...componentOptions, [option.name]: e.target.value })}
          />
        );
      case 'select':
        return (
          <Select
            value={componentOptions[option.name]}
            onValueChange={(value: string) => setComponentOptions({ ...componentOptions, [option.name]: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {option.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={option.name}
              checked={componentOptions[option.name]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComponentOptions({ ...componentOptions, [option.name]: e.target.checked })}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <label htmlFor={option.name} className="text-sm">{option.label}</label>
          </div>
        );
      case 'function':
        if (option.name === 'groups') {
          const groups = Array.isArray(componentOptions[option.name]) ? componentOptions[option.name] : [];
          return (
            <div className="space-y-4">
              {groups.map((group: any, groupIndex: number) => (
                <Card key={groupIndex} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <Input
                      className="flex-grow mr-2"
                      placeholder="Group Heading"
                      value={group.heading}
                      onChange={(e) => {
                        const newGroups = [...groups];
                        newGroups[groupIndex] = { ...newGroups[groupIndex], heading: e.target.value };
                        setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newGroups = groups.filter((_: any, index: any) => index !== groupIndex);
                        setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                      }}
                    >
                      Remove Group
                    </Button>
                  </div>
                  <div className="mt-2 space-y-4">
                    {group.items.map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="space-y-2 p-2 border rounded relative">

                        <div className="flex space-x-2">
                          <Input
                            className="w-1/3"
                            placeholder="Icon"
                            value={item.icon}
                            onChange={(e) => {
                              const newGroups = [...groups];
                              newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], icon: e.target.value };
                              setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                            }}
                          />
                          <Input
                            className="w-2/3"
                            placeholder="Label"
                            value={item.label}
                            onChange={(e) => {
                              const newGroups = [...groups];
                              newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], label: e.target.value };
                              setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                            }}
                          />
                        </div>
                        <div className='flex gap-2 justify-center items-center'>
                          <Input
                            placeholder="Shortcut (optional)"
                            value={item.shortcut || ''}
                            onChange={(e) => {
                              const newGroups = [...groups];
                              newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], shortcut: e.target.value };
                              setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                            }}
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newGroups = [...groups];
                              newGroups[groupIndex].items.splice(itemIndex, 1);
                              setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="mt-2"
                    onClick={() => {
                      const newGroups = [...groups];
                      newGroups[groupIndex].items.push({ icon: '', label: '', shortcut: '' });
                      setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                    }}
                  >
                    Add Item
                  </Button>
                </Card>
              ))}
              <Button
                onClick={() => {
                  const newGroups = [...groups, { heading: '', items: [] }];
                  setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                }}
              >
                Add Group
              </Button>
            </div>
          );
        }
        if (option.name === 'groups') {
          const groups = Array.isArray(componentOptions[option.name]) ? componentOptions[option.name] : [];
          return (
            <div className="space-y-4">
              {groups.map((group: any, groupIndex: number) => (
                <Card key={groupIndex} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <Input
                      className="flex-grow mr-2"
                      placeholder="Group Heading"
                      value={group.heading}
                      onChange={(e) => {
                        const newGroups = [...groups];
                        newGroups[groupIndex] = { ...newGroups[groupIndex], heading: e.target.value };
                        setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newGroups = groups.filter((_: any, index: any) => index !== groupIndex);
                        setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                      }}
                    >
                      Remove Group
                    </Button>
                  </div>
                  <div className="mt-2 space-y-4">
                    {group.items.map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="space-y-2 p-2 border rounded relative">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => {
                            const newGroups = [...groups];
                            newGroups[groupIndex].items.splice(itemIndex, 1);
                            setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                          }}
                        >
                          Remove
                        </Button>
                        <div className="flex space-x-2">
                          <Input
                            className="w-1/3"
                            placeholder="Icon"
                            value={item.icon}
                            onChange={(e) => {
                              const newGroups = [...groups];
                              newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], icon: e.target.value };
                              setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                            }}
                          />
                          <Input
                            className="w-2/3"
                            placeholder="Label"
                            value={item.label}
                            onChange={(e) => {
                              const newGroups = [...groups];
                              newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], label: e.target.value };
                              setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                            }}
                          />
                        </div>
                        <Input
                          placeholder="Shortcut (optional)"
                          value={item.shortcut || ''}
                          onChange={(e) => {
                            const newGroups = [...groups];
                            newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], shortcut: e.target.value };
                            setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    className="mt-2"
                    onClick={() => {
                      const newGroups = [...groups];
                      newGroups[groupIndex].items.push({ icon: '', label: '', shortcut: '' });
                      setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                    }}
                  >
                    Add Item
                  </Button>
                </Card>
              ))}
              <Button
                onClick={() => {
                  const newGroups = [...groups, { heading: '', items: [] }];
                  setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                }}
              >
                Add Group
              </Button>
            </div>
          );
        }
        if (option.name === 'groups') {
          const groups = Array.isArray(componentOptions[option.name]) ? componentOptions[option.name] : [];
          return (
            <div className="space-y-4">
              {groups.map((group: any, groupIndex: number) => (
                <Card key={groupIndex} className="p-4">
                  <Input
                    placeholder="Group Heading"
                    value={group.heading}
                    onChange={(e) => {
                      const newGroups = [...groups];
                      newGroups[groupIndex] = { ...newGroups[groupIndex], heading: e.target.value };
                      setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                    }}
                  />
                  <div className="mt-2 space-y-4">
                    {group.items.map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="flex flex-col gap-2 p-2 border rounded relative">
                        <div className="flex space-x-2">
                          <Input
                            className="w-1/3"
                            placeholder="Icon"
                            value={item.icon}
                            onChange={(e) => {
                              const newGroups = [...groups];
                              newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], icon: e.target.value };
                              setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                            }}
                          />
                          <Input
                            className="w-2/3"
                            placeholder="Label"
                            value={item.label}
                            onChange={(e) => {
                              const newGroups = [...groups];
                              newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], label: e.target.value };
                              setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                            }}
                          />
                        </div>
                        <div className='flex justify-center items-center gap-2'>
                          <Input
                            placeholder="Shortcut (optional)"
                            value={item.shortcut || ''}
                            onChange={(e) => {
                              const newGroups = [...groups];
                              newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], shortcut: e.target.value };
                              setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                            }}
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className=""
                            onClick={() => {
                              const newGroups = [...groups];
                              newGroups[groupIndex].items.splice(itemIndex, 1);
                              setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="mt-2"
                    onClick={() => {
                      const newGroups = [...groups];
                      newGroups[groupIndex].items.push({ icon: '', label: '', shortcut: '' });
                      setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                    }}
                  >
                    Add Item
                  </Button>
                </Card>
              ))}
              <Button
                onClick={() => {
                  const newGroups = [...groups, { heading: '', items: [] }];
                  setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                }}
              >
                Add Group
              </Button>
            </div>
          );
        }
        if (option.name === 'groups') {
          const groups = Array.isArray(componentOptions[option.name]) ? componentOptions[option.name] : [];
          return (
            <div className="space-y-4">
              {groups.map((group: any, groupIndex: number) => (
                <Card key={groupIndex} className="p-4">
                  <Input
                    placeholder="Group Heading"
                    value={group.heading}
                    onChange={(e) => {
                      const newGroups = [...groups];
                      newGroups[groupIndex] = { ...newGroups[groupIndex], heading: e.target.value };
                      setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                    }}
                  />
                  <div className="mt-2 space-y-4">
                    {group.items.map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="space-y-2 p-2 border rounded">
                        <div className="flex space-x-2">
                          <Input
                            className="w-1/3"
                            placeholder="Icon"
                            value={item.icon}
                            onChange={(e) => {
                              const newGroups = [...groups];
                              newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], icon: e.target.value };
                              setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                            }}
                          />
                          <Input
                            className="w-2/3"
                            placeholder="Label"
                            value={item.label}
                            onChange={(e) => {
                              const newGroups = [...groups];
                              newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], label: e.target.value };
                              setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                            }}
                          />
                        </div>
                        <Input
                          placeholder="Shortcut (optional)"
                          value={item.shortcut || ''}
                          onChange={(e) => {
                            const newGroups = [...groups];
                            newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], shortcut: e.target.value };
                            setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    className="mt-2"
                    onClick={() => {
                      const newGroups = [...groups];
                      newGroups[groupIndex].items.push({ icon: '', label: '', shortcut: '' });
                      setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                    }}
                  >
                    Add Item
                  </Button>
                </Card>
              ))}
              <Button
                onClick={() => {
                  const newGroups = [...groups, { heading: '', items: [] }];
                  setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                }}
              >
                Add Group
              </Button>
            </div>
          );
        }
        if (option.name === 'groups') {
          const groups = Array.isArray(componentOptions[option.name]) ? componentOptions[option.name] : [];
          return (
            <div className="space-y-4">
              {groups.map((group: any, groupIndex: number) => (
                <Card key={groupIndex} className="p-4">
                  <Input
                    placeholder="Group Heading"
                    value={group.heading}
                    onChange={(e) => {
                      const newGroups = [...groups];
                      newGroups[groupIndex] = { ...newGroups[groupIndex], heading: e.target.value };
                      setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                    }}
                  />
                  {group.items.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="mt-2 space-y-2">
                      <Input
                        placeholder="Icon"
                        value={item.icon}
                        onChange={(e) => {
                          const newGroups = [...groups];
                          newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], icon: e.target.value };
                          setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                        }}
                      />
                      <Input
                        placeholder="Label"
                        value={item.label}
                        onChange={(e) => {
                          const newGroups = [...groups];
                          newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], label: e.target.value };
                          setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                        }}
                      />
                      <Input
                        placeholder="Shortcut (optional)"
                        value={item.shortcut || ''}
                        onChange={(e) => {
                          const newGroups = [...groups];
                          newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], shortcut: e.target.value };
                          setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    className='mt-2'
                    onClick={() => {
                      const newGroups = [...groups];
                      newGroups[groupIndex].items.push({ icon: '', label: '', shortcut: '' });
                      setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                    }}
                  >
                    Add Item
                  </Button>
                </Card>
              ))}
              <Button
                onClick={() => {
                  const newGroups = [...groups, { heading: '', items: [] }];
                  setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                }}
              >
                Add Group
              </Button>
            </div>
          );
        }
        if (option.name === 'groups') {
          return (
            <div className="space-y-4">
              {componentOptions[option.name].map((group: any, groupIndex: number) => (
                <Card key={groupIndex} className="p-4">
                  <Input
                    placeholder="Group Heading"
                    value={group.heading}
                    onChange={(e) => {
                      const newGroups = [...componentOptions[option.name]];
                      newGroups[groupIndex] = { ...newGroups[groupIndex], heading: e.target.value };
                      setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                    }}
                  />
                  {group.items.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="mt-2 space-y-2">
                      <Input
                        placeholder="Icon"
                        value={item.icon}
                        onChange={(e) => {
                          const newGroups = [...componentOptions[option.name]];
                          newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], icon: e.target.value };
                          setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                        }}
                      />
                      <Input
                        placeholder="Label"
                        value={item.label}
                        onChange={(e) => {
                          const newGroups = [...componentOptions[option.name]];
                          newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], label: e.target.value };
                          setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                        }}
                      />
                      <Input
                        placeholder="Shortcut (optional)"
                        value={item.shortcut || ''}
                        onChange={(e) => {
                          const newGroups = [...componentOptions[option.name]];
                          newGroups[groupIndex].items[itemIndex] = { ...newGroups[groupIndex].items[itemIndex], shortcut: e.target.value };
                          setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() => {
                      const newGroups = [...componentOptions[option.name]];
                      newGroups[groupIndex].items.push({ icon: '', label: '', shortcut: '' });
                      setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                    }}
                  >
                    Add Item
                  </Button>
                </Card>
              ))}
              <Button
                onClick={() => {
                  const newGroups = [...componentOptions[option.name], { heading: '', items: [] }];
                  setComponentOptions({ ...componentOptions, [option.name]: newGroups });
                }}
              >
                Add Group
              </Button>
            </div>
          );
        }
        if (option.name === 'items' && Array.isArray(componentOptions[option.name])) {
          return (
            <div className="space-y-4">
              {componentOptions[option.name].map((item: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <Input
                      placeholder={`Trigger ${index + 1}`}
                      value={item.trigger}
                      onChange={(e) => {
                        const newItems = [...componentOptions[option.name]];
                        newItems[index] = { ...newItems[index], trigger: e.target.value };
                        setComponentOptions({ ...componentOptions, [option.name]: newItems });
                      }}
                    />
                    <Textarea
                      className="w-full p-2 border rounded"
                      placeholder={`Content ${index + 1}`}
                      value={item.content}
                      onChange={(e) => {
                        const newItems = [...componentOptions[option.name]];
                        newItems[index] = { ...newItems[index], content: e.target.value };
                        setComponentOptions({ ...componentOptions, [option.name]: newItems });
                      }}
                      rows={3}
                    />
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const newItems = componentOptions[option.name].filter((_: any, i: any) => i !== index);
                        setComponentOptions({ ...componentOptions, [option.name]: newItems });
                      }}
                    >
                      Remove Item
                    </Button>
                  </div>
                </Card>
              ))}
              <Button
                onClick={() => {
                  const newItems = [...componentOptions[option.name], { trigger: '', content: '' }];
                  setComponentOptions({ ...componentOptions, [option.name]: newItems });
                }}
              >
                Add Item
              </Button>
            </div>
          );
        }
        return null;
      case 'slider':
        return (
          <Slider
            value={[componentOptions[option.name]]}
            onValueChange={(value) => {
              setComponentOptions(prev => ({
                ...prev,
                [option.name]: value[0]
              }));
            }}
            max={option.max}
            min={option.min}
            step={1}
          />
        );
      case 'color':
        return (
          <ColorPicker
            color={componentOptions[option.name]}
            onChange={(color) => setComponentOptions({ ...componentOptions, [option.name]: color })}
          />
        );
      default:
        return null;
    }
  };

  const renderComponent = () => {
    const ComponentToRender = componentsConfig[selectedComponent].render;
    const props = Object.entries(componentOptions).reduce<Record<string, any>>((acc, [key, value]) => {
      const option = componentsConfig[selectedComponent].options.find(opt => opt.name === key);
      if (option && option.render) {
        return { ...acc, ...option.render(value) };
      }
      if (option && (option.type === 'function' || option.type === 'slider')) {
        return { ...acc, [key]: value };
      }
      return { ...acc, [key]: value };
    }, {});

    // Ensure 'items' is always an array for Accordion
    if (selectedComponent === 'accordion' && !Array.isArray(props.items)) {
      props.items = props.items ? [props.items] : [];
    }

    // For Button, we need to apply the roundness directly
    if (selectedComponent === 'button') {
      props.className = `rounded-[${props.roundness}px] ${props.className || ''}`;
    }

    return <ComponentToRender {...props} />;
  };

  const getComponentCode = (): string => {
    const config = componentsConfig[selectedComponent];

    switch (selectedComponent) {
      case 'button':
        let children = componentOptions.children || '';
        const isLoading = componentOptions.loading;
        const roundness = componentOptions.roundness;
        const useCustomColors = componentOptions.useCustomColors;
        const props = Object.entries(componentOptions)
          .filter(([key, value]) => {
            const option = config.options.find(opt => opt.name === key);
            return option?.type !== 'function' &&
                   !['children', 'loading', 'roundness', 'useCustomColors', 'backgroundColor', 'textColor'].includes(key);
          })
          .map(([key, value]) => {
            if (typeof value === 'boolean') {
              return value ? key : null;
            }
            return `${key}=${typeof value === 'string' ? `"${value}"` : `{${JSON.stringify(value)}}`}`;
          })
          .filter(Boolean)
          .join(' ');

        let imports = `${config.import}`;
        if (isLoading) {
          imports += `\nimport { Loader2 } from "lucide-react"`;
        }

        let style = `style={{ borderRadius: "${roundness}px"`;
        if (useCustomColors) {
          style += `, backgroundColor: "${componentOptions.backgroundColor}", color: "${componentOptions.textColor}"`;
        }
        style += ' }';

        return `${imports}

  export function ${config.name}Demo() {
    return (
      <${config.name}
        ${props}
        ${style}
        ${isLoading ? 'disabled' : ''}
      >
        ${isLoading ? '<Loader2 className="mr-2 h-4 w-4 animate-spin" />' : ''}
        ${children}
      </${config.name}>
    )
  }`;

      case 'alert':
        return `${config.import}

  export function AlertDemo() {
    return (
      <Alert variant="${componentOptions.variant}">
        <RocketIcon className="h-4 w-4" />
        <AlertTitle>${componentOptions.title}</AlertTitle>
        <AlertDescription>
          ${componentOptions.description}
        </AlertDescription>
      </Alert>
    )
  }`;

      case 'dialog':
        return `${config.import}
  import { Button } from "@/components/ui/button"

  export function DialogDemo() {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">${componentOptions.triggerText}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>${componentOptions.title}</DialogTitle>
            <DialogDescription>
              ${componentOptions.description}
            </DialogDescription>
          </DialogHeader>
          ${componentOptions.children}
        </DialogContent>
      </Dialog>
    )
  }`;

      case 'accordion':
        const items = componentOptions?.items?.map((item: any, index: number) => `
        <AccordionItem value="item-${index + 1}">
          <AccordionTrigger>${item.trigger}</AccordionTrigger>
          <AccordionContent>
            ${item.content}
          </AccordionContent>
        </AccordionItem>`).join('');

        return `${config.import}

  export function AccordionDemo() {
    return (
      <Accordion type="${componentOptions?.type}" collapsible={${componentOptions?.collapsible}} className="w-full">
        ${items}
      </Accordion>
    )
  }`;

      case 'popover':
        return `${config.import}
  import { Button } from "@/components/ui/button"

  export function PopoverDemo() {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">${componentOptions.triggerText}</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Popover Content</h4>
              <p className="text-sm text-muted-foreground">${componentOptions.content}</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }`;

      case 'command':
        const groups = Array.isArray(componentOptions.groups) ? componentOptions.groups : [];
        const groupsCode = groups.map((group: any) => `
    <CommandGroup heading="${group.heading}">
      ${group.items.map((item: any) => `
      <CommandItem>
        <${item.icon} className="mr-2 h-4 w-4" />
        <span>${item.label}</span>
        ${item.shortcut ? `<CommandShortcut>${item.shortcut}</CommandShortcut>` : ''}
      </CommandItem>`).join('')}
    </CommandGroup>`).join('\n');

        return `${config.import}

  export function CommandDemo() {
    return (
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="${componentOptions.placeholder}" />
        <CommandList>
          <CommandEmpty>${componentOptions.emptyMessage}</CommandEmpty>
          ${groupsCode}
        </CommandList>
      </Command>
    )
  }`;

      default:
        return '';
    }
  };
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getComponentCode());
      toast.success("Code copied to clipboard");
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy code");
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col justify-center items-center p-4 w-full max-w-6xl mx-auto mt-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <Card className='w-full'>
            <CardHeader>
              <CardTitle className='text-xl'>Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedComponent} onValueChange={setSelectedComponent}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(componentsConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {componentsConfig[selectedComponent].options.map((option) => (
                  <div key={option.name} className="space-y-2">
                    <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">{option.label}</label>
                    {renderOptionInput(option)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className='w-full'>
            <CardHeader>
              <CardTitle className='text-xl'>Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-start overflow-auto" style={{ minHeight: '400px', maxHeight: '600px' }}>
              {renderComponent()}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 w-full">
            <CardHeader>
              <CardTitle className='text-xl'>Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="dark:bg-zinc-900 bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code className="text-sm">{getComponentCode()}</code>
                </pre>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <FloatingBadge />
    </PageWrapper>
  );
};

export default ComponentRenderer;