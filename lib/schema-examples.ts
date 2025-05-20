// This file contains example schemas that can be used for testing
// You don't need to include this in your actual implementation

export const contactFormSchema = {
  title: "Contact Information",
  description: "Please provide your contact details",
  submitButtonText: "Submit",
  sections: [
    {
      columns: 2,
      fields: [
        {
          id: "firstName",
          type: "text",
          label: "First Name",
          placeholder: "Enter your first name",
          required: true,
        },
        {
          id: "lastName",
          type: "text",
          label: "Last Name",
          placeholder: "Enter your last name",
          required: true,
        },
        {
          id: "email",
          type: "email",
          label: "Email Address",
          placeholder: "your.email@example.com",
          required: true,
          pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
          helpText: "We'll never share your email with anyone else.",
        },
        {
          id: "phone",
          type: "phone",
          label: "Phone Number",
          placeholder: "(123) 456-7890",
          required: false,
        },
      ],
    },
    {
      title: "Address",
      columns: 1,
      fields: [
        {
          id: "address",
          type: "textarea",
          label: "Street Address",
          placeholder: "Enter your street address",
          rows: 2,
          required: true,
        },
        {
          id: "city",
          type: "text",
          label: "City",
          required: true,
        },
      ],
    },
    {
      columns: 2,
      fields: [
        {
          id: "state",
          type: "select",
          label: "State",
          required: true,
          options: [
            { label: "California", value: "CA" },
            { label: "New York", value: "NY" },
            { label: "Texas", value: "TX" },
          ],
        },
        {
          id: "zipCode",
          type: "text",
          label: "Zip Code",
          required: true,
          pattern: "^\\d{5}(-\\d{4})?$",
        },
      ],
    },
  ],
}

export const surveyFormSchema = {
  title: "Customer Satisfaction Survey",
  description: "Please help us improve our service by completing this survey",
  submitButtonText: "Submit Survey",
  sections: [
    {
      title: "Overall Experience",
      description: "Tell us about your overall experience with our service",
      columns: 1,
      fields: [
        {
          id: "satisfaction",
          type: "radio",
          label: "How satisfied are you with our service?",
          required: true,
          options: [
            { label: "Very Dissatisfied", value: "1" },
            { label: "Dissatisfied", value: "2" },
            { label: "Neutral", value: "3" },
            { label: "Satisfied", value: "4" },
            { label: "Very Satisfied", value: "5" },
          ],
        },
        {
          id: "recommendation",
          type: "range",
          label: "How likely are you to recommend us to a friend or colleague? (0-10)",
          min: 0,
          max: 10,
          step: 1,
          required: true,
        },
      ],
    },
    {
      title: "Product Feedback",
      columns: 1,
      fields: [
        {
          id: "usedFeatures",
          type: "checkbox",
          label: "Which features have you used?",
          required: true,
          options: [
            { label: "Online Ordering", value: "ordering" },
            { label: "Customer Support", value: "support" },
            { label: "Mobile App", value: "app" },
            { label: "Website", value: "website" },
          ],
        },
        {
          id: "improvements",
          type: "textarea",
          label: "What improvements would you suggest?",
          placeholder: "Please share your thoughts...",
          rows: 4,
        },
      ],
    },
  ],
}
