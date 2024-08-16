/* eslint-disable */
import MipmapElement from '../../phet-core/js/MipmapElement.js';

// The levels in the mipmap. Specify explicit types rather than inferring to assist the type checker, for this boilerplate case.
const mipmaps = [
  new MipmapElement( 259, 417, 'data:image/png;base64,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SC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4ASC4A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' ),
  new MipmapElement( 130, 209, 'data:image/png;base64,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' ),
  new MipmapElement( 65, 105, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABpCAYAAABlCE4eAAAAAklEQVR4AewaftIAAALRSURBVO3BsWujdRzH8ff38zx98tgkljrcldLNQhHpZAbbrQgVEW45Z0W6Cro5u+oiN+ggOInQ4RY3EVxKqaToUhehOKY0Pa5NQ9PmSfL7muGEG/QPaPJ9vYyXHB4eZkVRPCqK4uOU0psppQeTyaRuU9xfKcuyS0lnZnY8HA6/kvRXq9VKvGC80G63y6IofnD39+v1etFoNFSWJWbGfTeZTLi9vfXr62sfDofPJX1zeXn5xc7OTmLKmGq32+XCwsKveZ6/vbKyYrVajVnV7/fpdrujPM+/7ff7n21vb7u5OycnJ/tm9sHa2pqyLGOWuTt3d3ecnZ3dSfp8c3PziY6Pjx+Px+NHKysrlmUZs87MKMuS5eXlMqX0ydHRkVSW5UeNRqNWFIUxJ8yMpaUlpl6v1+ufajwebzabTZtinpgZ9Xrd3H1HKaWHRVEwb8yMWq1mUw/l7q9IYh5JIqVUioAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiIAIiDnn7ggYuTvzyN0xs5GyLLuoqop54+5UVeVm9lxTp4PBwKeYN4PBwCX9rqmnvV7PU0rMC3fn5ubGx+Pxs6qqvtbp6emTLMt+Oz8/T+7OrHN3JpOJX1xcpDzPf+x0OufZ/v4+e3t7Jymld6uqenVxcdGYMjNmjbszGo280+kk4Jder/fh7u4uGVOrq6ud9fX1P1JKb11fXz+QZAsLC0hiVlRVxdXVlXe73RHw02g0ery1tZWYMl5ycHCQNZvNL4H3UkrrWZblzAafTCYDM/uzKIrv8zz/bmNjg38Z/6Pdbr8h6R3gNe43Tyn9LennVqv1jP/wD4CUDtWUz7NcAAAAAElFTkSuQmCC' ),
  new MipmapElement( 33, 53, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAA1CAYAAADPo4LiAAAAAklEQVR4AewaftIAAAFZSURBVM3BMY4SARiG4ff/IGxmSDaxoaCRbmNFM6UNF/AAWphgSbUmexUtPYGdMUY7WwrgALZ2FExkgA2zvxQWXgD4nic4WSwWb7rd7n1ZlndAHwjOJCIeT343TfN5s9k8TCaT7K5Wq9dFUXwYDAa3kriAHjCq6/pe0jPgXWc2m30aDocjScEF9Xq9aNv2bjqd/lRZli8kBRcWEfT7/QJ4JaDkSjqdTmTmrTAgDAgDwoAwIAwIA8KAMCAMCAPCgDAgDAgDwoAwIAwIA8KAMCAMCAPCgDAgDAgDwoAwIAwIA8KAMCAMCAPCgDAgDAgDwoAwIAyIK8tMBOy5krZtMyIa7ff7X5nJpWUmu93uUdJ3HY/Hj+v1epeZXEpm0jTNU13XX8fj8bfgZLlcvr+5uZkVRTGSFJzZ4XDYbLfbL8fj8W1VVU/Bf+bz+cuIeM4ZZeafiPhRVVXDP38BXXBqslu23P0AAAAASUVORK5CYII=' ),
  new MipmapElement( 17, 27, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAbCAYAAACa9mScAAAAAklEQVR4AewaftIAAAC0SURBVK3BsU3DQACF4f/eXYGw5BsBJLyAC4+SghJlnixBQ0dBwRCuXCEPQEFvLpXlIyPg5H1fmOf5lHM+Ai0Q+L9zKeWj67rn1LbtsWmazH73McbDNE1vCiFkrpRSirXWR2EgDISBMBAGwkAYCANhIAyEgTAQBsJAGAgDYSAMhIEwEDeqtSLglyut67qFEL7TsiyvwEuM8Y4dtm1bSymffd+/By7GcXyQ9MQOtdafYRi+uPgDSuQuNltCyAYAAAAASUVORK5CYII=' )
];

export default mipmaps;