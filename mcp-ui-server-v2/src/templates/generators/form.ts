/**
 * Form Generator - Dynamic form template with comprehensive field types
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

// Field type definitions
const FormFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'email', 'password', 'number', 'tel', 'url', 'textarea', 'select', 'radio', 'checkbox', 'file', 'date', 'time', 'datetime-local', 'range', 'color']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  disabled: z.boolean().default(false),
  description: z.string().optional(),
  validation: z.object({
    min: z.union([z.number(), z.string()]).optional(),
    max: z.union([z.number(), z.string()]).optional(),
    pattern: z.string().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    custom: z.string().optional()
  }).optional(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
    disabled: z.boolean().default(false)
  })).optional(),
  defaultValue: z.any().optional(),
  className: z.string().optional(),
  grid: z.object({
    span: z.number().min(1).max(12).default(12),
    offset: z.number().min(0).max(11).default(0)
  }).optional()
});

const FormSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  collapsible: z.boolean().default(false),
  collapsed: z.boolean().default(false),
  fields: z.array(FormFieldSchema)
});

// Form configuration schema
const FormConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('POST'),
  action: z.string().optional(),
  enctype: z.enum(['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain']).default('application/x-www-form-urlencoded'),
  sections: z.array(FormSectionSchema),
  layout: z.object({
    type: z.enum(['single-column', 'two-column', 'grid', 'card', 'wizard']).default('single-column'),
    spacing: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
    labelPosition: z.enum(['top', 'left', 'floating']).default('top'),
    showProgress: z.boolean().default(false),
    showValidation: z.boolean().default(true)
  }),
  actions: z.object({
    submit: z.object({
      label: z.string().default('Submit'),
      variant: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('primary'),
      size: z.enum(['sm', 'md', 'lg']).default('md'),
      loading: z.boolean().default(false),
      disabled: z.boolean().default(false)
    }),
    cancel: z.object({
      label: z.string().default('Cancel'),
      variant: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('outline'),
      size: z.enum(['sm', 'md', 'lg']).default('md'),
      show: z.boolean().default(false)
    }).optional(),
    reset: z.object({
      label: z.string().default('Reset'),
      variant: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('ghost'),
      size: z.enum(['sm', 'md', 'lg']).default('md'),
      show: z.boolean().default(false)
    }).optional()
  }),
  validation: z.object({
    mode: z.enum(['onChange', 'onBlur', 'onSubmit']).default('onSubmit'),
    showErrors: z.boolean().default(true),
    showSuccess: z.boolean().default(false),
    customMessages: z.record(z.string()).optional()
  }),
  styling: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    colors: z.object({
      primary: z.string().default('#3b82f6'),
      secondary: z.string().default('#64748b'),
      success: z.string().default('#10b981'),
      warning: z.string().default('#f59e0b'),
      error: z.string().default('#ef4444')
    }).optional(),
    borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md'),
    shadow: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('sm')
  }).optional()
});

type FormConfig = z.infer<typeof FormConfigSchema>;

export class FormGenerator implements TemplateGenerator<FormConfig> {
  name = 'Dynamic Form Generator';
  description = 'Generate comprehensive forms with dynamic fields, validation, and layouts';
  capabilities = [
    'Dynamic field types',
    'Multi-section forms',
    'Advanced validation',
    'Responsive layouts',
    'Custom styling',
    'Progress tracking',
    'Conditional fields',
    'File uploads',
    'Data binding'
  ];
  useCases = [
    'Contact forms',
    'Registration forms',
    'Survey forms',
    'Order forms',
    'Feedback forms',
    'Application forms',
    'Settings forms',
    'Profile forms',
    'Checkout forms',
    'Multi-step wizards'
  ];
  schema = FormConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<FormConfig> {
    // Use custom form data if provided
    if (params.customData?.form) {
      return this.validateAndEnhanceCustomForm(params.customData.form);
    }

    // Generate form based on use case
    return this.generateFormByUseCase(params);
  }

  async validate(config: FormConfig): Promise<boolean> {
    try {
      FormConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<FormConfig[]> {
    return [
      await this.generateContactForm(),
      await this.generateRegistrationForm(),
      await this.generateSurveyForm(),
      await this.generateOrderForm()
    ];
  }

  private validateAndEnhanceCustomForm(customForm: any): FormConfig {
    // Validate the custom form structure
    const validated = FormConfigSchema.parse(customForm);
    
    // Enhance with missing defaults
    return {
      ...validated,
      sections: validated.sections.map(section => ({
        ...section,
        fields: section.fields.map(field => ({
          ...field,
          grid: field.grid || { span: 12, offset: 0 }
        }))
      }))
    };
  }

  private generateFormByUseCase(params: TemplateGenerationParams): FormConfig {
    const useCase = params.useCase?.toLowerCase() || '';
    const title = params.title || 'Dynamic Form';

    if (useCase.includes('contact')) {
      return this.generateContactForm(title);
    } else if (useCase.includes('registration') || useCase.includes('signup')) {
      return this.generateRegistrationForm(title);
    } else if (useCase.includes('survey') || useCase.includes('feedback')) {
      return this.generateSurveyForm(title);
    } else if (useCase.includes('order') || useCase.includes('checkout')) {
      return this.generateOrderForm(title);
    } else if (useCase.includes('profile') || useCase.includes('account')) {
      return this.generateProfileForm(title);
    } else if (useCase.includes('settings')) {
      return this.generateSettingsForm(title);
    } else if (useCase.includes('application') || useCase.includes('job')) {
      return this.generateApplicationForm(title);
    } else {
      return this.generateGenericForm(title, params);
    }
  }

  private generateContactForm(title: string = 'Contact Us'): FormConfig {
    return {
      id: 'contact-form',
      title,
      description: 'Get in touch with us',
      method: 'POST',
      action: '/api/contact',
      sections: [{
        id: 'contact-info',
        title: 'Contact Information',
        fields: [
          {
            id: 'name',
            type: 'text',
            label: 'Full Name',
            placeholder: 'Enter your full name',
            required: true,
            validation: { minLength: 2, maxLength: 100 },
            grid: { span: 6, offset: 0 }
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            placeholder: 'Enter your email',
            required: true,
            validation: { pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
            grid: { span: 6, offset: 0 }
          },
          {
            id: 'phone',
            type: 'tel',
            label: 'Phone Number',
            placeholder: 'Enter your phone number',
            required: false,
            grid: { span: 6, offset: 0 }
          },
          {
            id: 'company',
            type: 'text',
            label: 'Company',
            placeholder: 'Enter your company name',
            required: false,
            grid: { span: 6, offset: 0 }
          },
          {
            id: 'subject',
            type: 'select',
            label: 'Subject',
            required: true,
            options: [
              { value: 'general', label: 'General Inquiry' },
              { value: 'support', label: 'Technical Support' },
              { value: 'sales', label: 'Sales Question' },
              { value: 'partnership', label: 'Partnership' },
              { value: 'other', label: 'Other' }
            ],
            grid: { span: 12, offset: 0 }
          },
          {
            id: 'message',
            type: 'textarea',
            label: 'Message',
            placeholder: 'Enter your message',
            required: true,
            validation: { minLength: 10, maxLength: 1000 },
            grid: { span: 12, offset: 0 }
          }
        ]
      }],
      layout: {
        type: 'grid',
        spacing: 'normal',
        labelPosition: 'top',
        showValidation: true,
        showProgress: false
      },
      actions: {
        submit: {
          label: 'Send Message',
          variant: 'primary',
          size: 'md'
        },
        reset: {
          label: 'Clear Form',
          variant: 'outline',
          size: 'md',
          show: true
        }
      },
      validation: {
        mode: 'onSubmit',
        showErrors: true,
        showSuccess: true
      },
      styling: {
        theme: 'auto',
        borderRadius: 'md',
        shadow: 'sm'
      }
    };
  }

  private generateRegistrationForm(title: string = 'Create Account'): FormConfig {
    return {
      id: 'registration-form',
      title,
      description: 'Join our platform today',
      method: 'POST',
      action: '/api/register',
      sections: [
        {
          id: 'personal-info',
          title: 'Personal Information',
          fields: [
            {
              id: 'firstName',
              type: 'text',
              label: 'First Name',
              placeholder: 'Enter your first name',
              required: true,
              validation: { minLength: 2, maxLength: 50 },
              grid: { span: 6, offset: 0 }
            },
            {
              id: 'lastName',
              type: 'text',
              label: 'Last Name',
              placeholder: 'Enter your last name',
              required: true,
              validation: { minLength: 2, maxLength: 50 },
              grid: { span: 6, offset: 0 }
            },
            {
              id: 'email',
              type: 'email',
              label: 'Email Address',
              placeholder: 'Enter your email',
              required: true,
              validation: { pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
              grid: { span: 12, offset: 0 }
            },
            {
              id: 'password',
              type: 'password',
              label: 'Password',
              placeholder: 'Create a password',
              required: true,
              validation: { minLength: 8, custom: 'Must contain uppercase, lowercase, number, and special character' },
              grid: { span: 6, offset: 0 }
            },
            {
              id: 'confirmPassword',
              type: 'password',
              label: 'Confirm Password',
              placeholder: 'Confirm your password',
              required: true,
              validation: { custom: 'Must match password' },
              grid: { span: 6, offset: 0 }
            }
          ]
        },
        {
          id: 'preferences',
          title: 'Preferences',
          fields: [
            {
              id: 'newsletter',
              type: 'checkbox',
              label: 'Subscribe to newsletter',
              defaultValue: true,
              grid: { span: 12, offset: 0 }
            },
            {
              id: 'terms',
              type: 'checkbox',
              label: 'I agree to the Terms of Service and Privacy Policy',
              required: true,
              grid: { span: 12, offset: 0 }
            }
          ]
        }
      ],
      layout: {
        type: 'card',
        spacing: 'normal',
        labelPosition: 'top',
        showValidation: true,
        showProgress: true
      },
      actions: {
        submit: {
          label: 'Create Account',
          variant: 'primary',
          size: 'lg'
        },
        cancel: {
          label: 'Already have an account?',
          variant: 'ghost',
          size: 'md',
          show: true
        }
      },
      validation: {
        mode: 'onBlur',
        showErrors: true,
        showSuccess: true
      },
      styling: {
        theme: 'auto',
        borderRadius: 'lg',
        shadow: 'md'
      }
    };
  }

  private generateSurveyForm(title: string = 'Customer Survey'): FormConfig {
    return {
      id: 'survey-form',
      title,
      description: 'Help us improve our services',
      method: 'POST',
      action: '/api/survey',
      sections: [
        {
          id: 'experience',
          title: 'Your Experience',
          fields: [
            {
              id: 'satisfaction',
              type: 'radio',
              label: 'How satisfied are you with our service?',
              required: true,
              options: [
                { value: '5', label: 'Very Satisfied' },
                { value: '4', label: 'Satisfied' },
                { value: '3', label: 'Neutral' },
                { value: '2', label: 'Dissatisfied' },
                { value: '1', label: 'Very Dissatisfied' }
              ],
              grid: { span: 12, offset: 0 }
            },
            {
              id: 'recommend',
              type: 'range',
              label: 'How likely are you to recommend us? (0-10)',
              validation: { min: 0, max: 10 },
              defaultValue: 5,
              grid: { span: 12, offset: 0 }
            },
            {
              id: 'feedback',
              type: 'textarea',
              label: 'Additional Feedback',
              placeholder: 'Tell us what we can improve...',
              validation: { maxLength: 500 },
              grid: { span: 12, offset: 0 }
            }
          ]
        }
      ],
      layout: {
        type: 'single-column',
        spacing: 'relaxed',
        labelPosition: 'top',
        showValidation: true,
        showProgress: false
      },
      actions: {
        submit: {
          label: 'Submit Survey',
          variant: 'primary',
          size: 'md'
        }
      },
      validation: {
        mode: 'onChange',
        showErrors: true,
        showSuccess: false
      },
      styling: {
        theme: 'auto',
        borderRadius: 'md',
        shadow: 'sm'
      }
    };
  }

  private generateOrderForm(title: string = 'Place Order'): FormConfig {
    return {
      id: 'order-form',
      title,
      description: 'Complete your purchase',
      method: 'POST',
      action: '/api/orders',
      enctype: 'multipart/form-data',
      sections: [
        {
          id: 'shipping',
          title: 'Shipping Information',
          fields: [
            {
              id: 'shippingName',
              type: 'text',
              label: 'Full Name',
              required: true,
              grid: { span: 6, offset: 0 }
            },
            {
              id: 'shippingPhone',
              type: 'tel',
              label: 'Phone Number',
              required: true,
              grid: { span: 6, offset: 0 }
            },
            {
              id: 'shippingAddress',
              type: 'text',
              label: 'Street Address',
              required: true,
              grid: { span: 12, offset: 0 }
            },
            {
              id: 'shippingCity',
              type: 'text',
              label: 'City',
              required: true,
              grid: { span: 4, offset: 0 }
            },
            {
              id: 'shippingState',
              type: 'select',
              label: 'State',
              required: true,
              options: [
                { value: 'CA', label: 'California' },
                { value: 'NY', label: 'New York' },
                { value: 'TX', label: 'Texas' }
              ],
              grid: { span: 4, offset: 0 }
            },
            {
              id: 'shippingZip',
              type: 'text',
              label: 'ZIP Code',
              required: true,
              validation: { pattern: '^\\d{5}(-\\d{4})?$' },
              grid: { span: 4, offset: 0 }
            }
          ]
        },
        {
          id: 'payment',
          title: 'Payment Information',
          fields: [
            {
              id: 'cardNumber',
              type: 'text',
              label: 'Card Number',
              placeholder: '1234 5678 9012 3456',
              required: true,
              validation: { pattern: '^\\d{4}\\s\\d{4}\\s\\d{4}\\s\\d{4}$' },
              grid: { span: 12, offset: 0 }
            },
            {
              id: 'expiryDate',
              type: 'text',
              label: 'Expiry Date',
              placeholder: 'MM/YY',
              required: true,
              validation: { pattern: '^\\d{2}/\\d{2}$' },
              grid: { span: 6, offset: 0 }
            },
            {
              id: 'cvv',
              type: 'text',
              label: 'CVV',
              placeholder: '123',
              required: true,
              validation: { pattern: '^\\d{3,4}$' },
              grid: { span: 6, offset: 0 }
            }
          ]
        }
      ],
      layout: {
        type: 'wizard',
        spacing: 'normal',
        labelPosition: 'top',
        showValidation: true,
        showProgress: true
      },
      actions: {
        submit: {
          label: 'Place Order',
          variant: 'primary',
          size: 'lg'
        },
        cancel: {
          label: 'Cancel',
          variant: 'outline',
          size: 'md',
          show: true
        }
      },
      validation: {
        mode: 'onBlur',
        showErrors: true,
        showSuccess: false
      },
      styling: {
        theme: 'auto',
        colors: {
          primary: '#10b981',
          secondary: '#64748b',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        borderRadius: 'md',
        shadow: 'lg'
      }
    };
  }

  private generateProfileForm(title: string = 'Profile Settings'): FormConfig {
    return {
      id: 'profile-form',
      title,
      description: 'Update your profile information',
      method: 'PUT',
      action: '/api/profile',
      enctype: 'multipart/form-data',
      sections: [{
        id: 'profile-info',
        title: 'Profile Information',
        fields: [
          {
            id: 'avatar',
            type: 'file',
            label: 'Profile Picture',
            description: 'Upload a profile picture (max 5MB)',
            grid: { span: 12, offset: 0 }
          },
          {
            id: 'bio',
            type: 'textarea',
            label: 'Bio',
            placeholder: 'Tell us about yourself...',
            validation: { maxLength: 300 },
            grid: { span: 12, offset: 0 }
          },
          {
            id: 'website',
            type: 'url',
            label: 'Website',
            placeholder: 'https://example.com',
            grid: { span: 6, offset: 0 }
          },
          {
            id: 'location',
            type: 'text',
            label: 'Location',
            placeholder: 'City, Country',
            grid: { span: 6, offset: 0 }
          }
        ]
      }],
      layout: {
        type: 'single-column',
        spacing: 'normal',
        labelPosition: 'top',
        showValidation: true,
        showProgress: false
      },
      actions: {
        submit: {
          label: 'Save Changes',
          variant: 'primary',
          size: 'md'
        },
        reset: {
          label: 'Reset',
          variant: 'outline',
          size: 'md',
          show: true
        }
      },
      validation: {
        mode: 'onBlur',
        showErrors: true,
        showSuccess: true
      },
      styling: {
        theme: 'auto',
        borderRadius: 'md',
        shadow: 'sm'
      }
    };
  }

  private generateSettingsForm(title: string = 'Settings'): FormConfig {
    return {
      id: 'settings-form',
      title,
      description: 'Configure your preferences',
      method: 'PUT',
      action: '/api/settings',
      sections: [
        {
          id: 'notifications',
          title: 'Notifications',
          fields: [
            {
              id: 'emailNotifications',
              type: 'checkbox',
              label: 'Email notifications',
              defaultValue: true,
              grid: { span: 12, offset: 0 }
            },
            {
              id: 'pushNotifications',
              type: 'checkbox',
              label: 'Push notifications',
              defaultValue: false,
              grid: { span: 12, offset: 0 }
            }
          ]
        },
        {
          id: 'privacy',
          title: 'Privacy',
          fields: [
            {
              id: 'profileVisibility',
              type: 'radio',
              label: 'Profile visibility',
              required: true,
              options: [
                { value: 'public', label: 'Public' },
                { value: 'friends', label: 'Friends only' },
                { value: 'private', label: 'Private' }
              ],
              defaultValue: 'friends',
              grid: { span: 12, offset: 0 }
            }
          ]
        }
      ],
      layout: {
        type: 'card',
        spacing: 'normal',
        labelPosition: 'top',
        showValidation: true,
        showProgress: false
      },
      actions: {
        submit: {
          label: 'Save Settings',
          variant: 'primary',
          size: 'md'
        }
      },
      validation: {
        mode: 'onChange',
        showErrors: true,
        showSuccess: true
      },
      styling: {
        theme: 'auto',
        borderRadius: 'md',
        shadow: 'sm'
      }
    };
  }

  private generateApplicationForm(title: string = 'Job Application'): FormConfig {
    return {
      id: 'application-form',
      title,
      description: 'Apply for this position',
      method: 'POST',
      action: '/api/applications',
      enctype: 'multipart/form-data',
      sections: [
        {
          id: 'personal',
          title: 'Personal Information',
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Full Name',
              required: true,
              grid: { span: 6, offset: 0 }
            },
            {
              id: 'email',
              type: 'email',
              label: 'Email',
              required: true,
              grid: { span: 6, offset: 0 }
            },
            {
              id: 'phone',
              type: 'tel',
              label: 'Phone Number',
              required: true,
              grid: { span: 6, offset: 0 }
            },
            {
              id: 'linkedin',
              type: 'url',
              label: 'LinkedIn Profile',
              placeholder: 'https://linkedin.com/in/username',
              grid: { span: 6, offset: 0 }
            }
          ]
        },
        {
          id: 'documents',
          title: 'Documents',
          fields: [
            {
              id: 'resume',
              type: 'file',
              label: 'Resume/CV',
              description: 'Upload your resume (PDF preferred)',
              required: true,
              grid: { span: 6, offset: 0 }
            },
            {
              id: 'coverLetter',
              type: 'file',
              label: 'Cover Letter',
              description: 'Optional cover letter',
              grid: { span: 6, offset: 0 }
            }
          ]
        },
        {
          id: 'experience',
          title: 'Experience',
          fields: [
            {
              id: 'experience',
              type: 'select',
              label: 'Years of Experience',
              required: true,
              options: [
                { value: '0-1', label: '0-1 years' },
                { value: '2-3', label: '2-3 years' },
                { value: '4-5', label: '4-5 years' },
                { value: '6-10', label: '6-10 years' },
                { value: '10+', label: '10+ years' }
              ],
              grid: { span: 12, offset: 0 }
            },
            {
              id: 'motivation',
              type: 'textarea',
              label: 'Why do you want to work here?',
              placeholder: 'Tell us about your motivation...',
              required: true,
              validation: { minLength: 50, maxLength: 500 },
              grid: { span: 12, offset: 0 }
            }
          ]
        }
      ],
      layout: {
        type: 'wizard',
        spacing: 'normal',
        labelPosition: 'top',
        showValidation: true,
        showProgress: true
      },
      actions: {
        submit: {
          label: 'Submit Application',
          variant: 'primary',
          size: 'lg'
        },
        cancel: {
          label: 'Save Draft',
          variant: 'outline',
          size: 'md',
          show: true
        }
      },
      validation: {
        mode: 'onBlur',
        showErrors: true,
        showSuccess: false
      },
      styling: {
        theme: 'auto',
        borderRadius: 'lg',
        shadow: 'md'
      }
    };
  }

  private generateGenericForm(title: string, params: TemplateGenerationParams): FormConfig {
    const fieldCount = params.customData?.fieldCount || 5;
    const fields = [];

    for (let i = 0; i < fieldCount; i++) {
      fields.push({
        id: `field_${i + 1}`,
        type: 'text' as const,
        label: `Field ${i + 1}`,
        placeholder: `Enter value for field ${i + 1}`,
        required: i < 2, // First 2 fields required
        grid: { span: i % 2 === 0 ? 6 : 6, offset: 0 }
      });
    }

    return {
      id: 'generic-form',
      title,
      description: 'A dynamically generated form',
      method: 'POST',
      action: '/api/submit',
      sections: [{
        id: 'main-section',
        title: 'Form Fields',
        fields
      }],
      layout: {
        type: 'grid',
        spacing: 'normal',
        labelPosition: 'top',
        showValidation: true,
        showProgress: false
      },
      actions: {
        submit: {
          label: 'Submit',
          variant: 'primary',
          size: 'md'
        }
      },
      validation: {
        mode: 'onSubmit',
        showErrors: true,
        showSuccess: false
      },
      styling: {
        theme: 'auto',
        borderRadius: 'md',
        shadow: 'sm'
      }
    };
  }
}