export const gridsterOptions = {
  lanes: 2,
  direction: 'vertical',
  floating: false,
  dragAndDrop: true,
  resizable: true,
  shrink: true,
  responsiveView: true,
  resizeHandles: {
    s: true,
    e: false,
    n: false,
    w: false,
    se: true,
    ne: false,
    sw: false,
    nw: false
  },
  tolerance: 'touch',
  widthHeightRatio: 1,
  responsiveOptions: [
    {
      breakpoint: 'sm',
      lanes: 2
    },
    {
      breakpoint: 'md',
      minWidth: 768,
      lanes: 2,
      dragAndDrop: true
    },
    {
      breakpoint: 'lg',
      lanes: 4,
      dragAndDrop: true
    },
    {
      breakpoint: 'xl',
      minWidth: 1800,
      lanes: 6,
      dragAndDrop: true
    }
  ]
};
