"use client"
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button, ButtonProps } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Clipboard, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import PageWrapper from "../components/wrapper/page-wrapper";

type OptionType = {
  name: string;
  type: 'text' | 'select' | 'boolean' | 'function';
  label: string;
  default: string | boolean;
  options?: string[];
  render?: (value: any) => Partial<ButtonProps>;
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

// Component Configuration
const componentsConfig: ComponentsConfig = {
  button: {
    name: 'Button',
    import: 'import { Button } from "@/components/ui/button"',
    component: Button,
    render: (props: ButtonProps) => <Button {...props}>{props.children}</Button>,
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
  }
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
          <input
            type="checkbox"
            checked={componentOptions[option.name]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComponentOptions({ ...componentOptions, [option.name]: e.target.checked })}
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
      if (option && option.type === 'function') {
        return acc; // Skip function props in preview
      }
      return { ...acc, [key]: value };
    }, {});

    return <ComponentToRender {...props} />;
  };

  const getComponentCode = (): string => {
    const config = componentsConfig[selectedComponent];
    if (selectedComponent === 'dialog') {
      return `${config.import}

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
</Dialog>`;
    } else {
      const props = Object.entries(componentOptions)
        .filter(([key, value]) => {
          const option = config.options.find(opt => opt.name === key);
          return option?.type !== 'function';
        })
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return value ? key : null;
          }
          return `${key}=${typeof value === 'string' ? `"${value}"` : `{${JSON.stringify(value)}}`}`;
        })
        .filter(Boolean)
        .join(' ');
      return `${config.import}\n\n<${config.name} ${props} />`;
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col justify-center items-center p-4 w-full max-w-4xl mx-auto mt-[2rem]">
        <h1 className="text-4xl font-semibold mb-8">Component Renderer</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Options</CardTitle>
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
                  option.type !== 'function' && (
                    <div key={option.name}>
                      <label className="block text-sm font-medium dark:text-gray-200 text-gray-700 mb-1">{option.label}</label>
                      {renderOptionInput(option)}
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-40">
              {renderComponent()}
            </CardContent>
          </Card>
          <Card className="md:col-span-2 w-full">
            <CardHeader>
              <CardTitle>Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="dark:dark:bg-zinc-900 bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>{getComponentCode()}</code>
                </pre>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => navigator.clipboard.writeText(getComponentCode())}
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ComponentRenderer;